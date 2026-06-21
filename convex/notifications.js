import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

// Get all notifications for the current user (most recent first)
export const getNotifications = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) return [];

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(50);

    // Attach event info to each notification
    const withEvents = await Promise.all(
      notifications.map(async (n) => {
        const event = await ctx.db.get(n.eventId);
        return {
          ...n,
          eventTitle: event?.title ?? "Unknown Event",
          eventSlug: n.eventSlug ?? event?.slug ?? "",
          eventStartDate: event?.startDate ?? 0,
          eventCoverImage: event?.coverImage ?? null,
        };
      })
    );

    return withEvents;
  },
});

// Get unread notification count for the current user
export const getUnreadCount = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return 0;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) return 0;

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) =>
        q.eq("userId", user._id).eq("read", false)
      )
      .collect();

    return unread.length;
  },
});

// Mark a single notification as read
export const markAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, { notificationId }) => {
    const notification = await ctx.db.get(notificationId);
    if (!notification) throw new Error("Notification not found");

    await ctx.db.patch(notificationId, { read: true });
  },
});

// Mark all notifications as read for the current user
export const markAllAsRead = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) throw new Error("User not found");

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) =>
        q.eq("userId", user._id).eq("read", false)
      )
      .collect();

    for (const n of unread) {
      await ctx.db.patch(n._id, { read: true });
    }

    return { marked: unread.length };
  },
});

// ─── Internal: Scan for approaching events & create notifications ───
export const checkAndCreateNotifications = internalMutation({
  handler: async (ctx) => {
    const now = Date.now();
    const twentyFourHoursLater = now + 24 * 60 * 60 * 1000;

    // Get all events starting within the next 24 hours
    const allEvents = await ctx.db
      .query("events")
      .withIndex("by_start_date")
      .collect();

    const approachingEvents = allEvents.filter(
      (e) => e.startDate > now && e.startDate <= twentyFourHoursLater
    );

    let notificationsCreated = 0;

    for (const event of approachingEvents) {
      // ── Case A: Registered users ──
      const registrations = await ctx.db
        .query("registrations")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .collect();

      const confirmedRegs = registrations.filter(
        (r) => r.status === "confirmed"
      );

      for (const reg of confirmedRegs) {
        // Check if notification already exists for this user+event+type
        const existing = await ctx.db
          .query("notifications")
          .withIndex("by_user_event_type", (q) =>
            q
              .eq("userId", reg.userId)
              .eq("eventId", event._id)
              .eq("type", "registered_approaching")
          )
          .unique();

        if (!existing) {
          const hoursUntil = Math.round(
            (event.startDate - now) / (1000 * 60 * 60)
          );

          await ctx.db.insert("notifications", {
            userId: reg.userId,
            title: "Your event is coming up!",
            message: `"${event.title}" starts in ~${hoursUntil} hour${hoursUntil !== 1 ? "s" : ""}. Don't miss it!`,
            type: "registered_approaching",
            eventId: event._id,
            eventSlug: event.slug,
            read: false,
            emailSent: false,
            createdAt: now,
          });

          // Schedule email action
          const user = await ctx.db.get(reg.userId);
          if (user?.email) {
            await ctx.scheduler.runAfter(
              0,
              internal.emails.sendNotificationEmail,
              {
                to: user.email,
                userName: user.name,
                eventTitle: event.title,
                eventDate: event.startDate,
                eventSlug: event.slug,
                type: "registered_approaching",
              }
            );
          }

          notificationsCreated++;
        }
      }

      // ── Case B: Users with matching interests (not registered) ──
      const registeredUserIds = new Set(
        confirmedRegs.map((r) => r.userId.toString())
      );

      // Get all users who have this event's category in their interests
      const allUsers = await ctx.db.query("users").collect();
      const interestedUsers = allUsers.filter(
        (u) =>
          u.hasCompletedOnboarding &&
          u.interests &&
          u.interests.includes(event.category) &&
          !registeredUserIds.has(u._id.toString())
      );

      for (const user of interestedUsers) {
        const existing = await ctx.db
          .query("notifications")
          .withIndex("by_user_event_type", (q) =>
            q
              .eq("userId", user._id)
              .eq("eventId", event._id)
              .eq("type", "interest_approaching")
          )
          .unique();

        if (!existing) {
          const hoursUntil = Math.round(
            (event.startDate - now) / (1000 * 60 * 60)
          );

          await ctx.db.insert("notifications", {
            userId: user._id,
            title: "Event you might like!",
            message: `"${event.title}" in ${event.category} starts in ~${hoursUntil} hour${hoursUntil !== 1 ? "s" : ""}. Check it out!`,
            type: "interest_approaching",
            eventId: event._id,
            eventSlug: event.slug,
            read: false,
            emailSent: false,
            createdAt: now,
          });

          // Schedule email action
          if (user.email) {
            await ctx.scheduler.runAfter(
              0,
              internal.emails.sendNotificationEmail,
              {
                to: user.email,
                userName: user.name,
                eventTitle: event.title,
                eventDate: event.startDate,
                eventSlug: event.slug,
                type: "interest_approaching",
              }
            );
          }

          notificationsCreated++;
        }
      }
    }

    return {
      eventsChecked: approachingEvents.length,
      notificationsCreated,
    };
  },
});

// ─── TEST: Manually trigger a test notification + email for the current user ───
// Call this from the Convex dashboard or a test button to verify the full pipeline.
export const testNotificationAndEmail = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated — sign in first");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) throw new Error("User not found in database");

    // Pick a real event if one exists, otherwise use a placeholder
    const anyEvent = await ctx.db.query("events").first();

    const eventId = anyEvent?._id;
    const eventTitle = anyEvent?.title ?? "Test Event — Spott Notification";
    const eventSlug = anyEvent?.slug ?? "test-event";
    const eventStartDate = anyEvent?.startDate ?? Date.now() + 3 * 60 * 60 * 1000; // 3 hours from now

    // Only insert notification if we have a valid eventId
    let notificationId = null;
    if (eventId) {
      notificationId = await ctx.db.insert("notifications", {
        userId: user._id,
        title: "🧪 Test — Your event is coming up!",
        message: `"${eventTitle}" starts soon. This is a test notification.`,
        type: "registered_approaching",
        eventId: eventId,
        eventSlug: eventSlug,
        read: false,
        emailSent: false,
        createdAt: Date.now(),
      });
    }

    // Schedule test email
    await ctx.scheduler.runAfter(
      0,
      internal.emails.sendNotificationEmail,
      {
        to: user.email,
        userName: user.name,
        eventTitle: eventTitle,
        eventDate: eventStartDate,
        eventSlug: eventSlug,
        type: "registered_approaching",
      }
    );

    return {
      success: true,
      notificationId,
      emailScheduledTo: user.email,
      eventUsed: eventTitle,
    };
  },
});
