import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

// Record user interactions (viewed, clicked, shared, etc.)
export const recordInteraction = mutation({
  args: {
    eventId: v.id("events"),
    userId: v.id("users"),
    interactionType: v.union(v.literal("viewed"), v.literal("clicked"), v.literal("shared"), v.literal("bookmarked")),
  },
  handler: async (ctx, args) => {
    // Increment event view count if it's a "viewed" interaction
    if (args.interactionType === "viewed") {
      const event = await ctx.db.get(args.eventId);
      if (event) {
        await ctx.db.patch(args.eventId, {
          viewCount: (event.viewCount ?? 0) + 1,
        });
      }
    }
    await ctx.db.insert("eventInteractions", { ...args, createdAt: Date.now() });
  },
});

// Query analytics for a specific event
export const getEventAnalytics = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const [event, registrations, attendance, likes, interactions] = await Promise.all([
      ctx.db.get(eventId),
      ctx.db.query("registrations").withIndex("by_event", (q) => q.eq("eventId", eventId)).collect(),
      ctx.db.query("attendance").withIndex("by_event", (q) => q.eq("eventId", eventId)).collect(),
      ctx.db.query("eventLikes").withIndex("by_event", (q) => q.eq("eventId", eventId)).collect(),
      ctx.db.query("eventInteractions").withIndex("by_event", (q) => q.eq("eventId", eventId)).collect(),
    ]);

    const interactionsMap = interactions.reduce((acc, i) => {
      acc[i.interactionType] = (acc[i.interactionType] ?? 0) + 1;
      return acc;
    }, {});

    // Confirmed registrations only
    const confirmedRegistrations = registrations.filter((r) => r.status === "confirmed");

    const now = Date.now();
    const DAY = 86400000;
    const timeline = Array.from({ length: 7 }, (_, i) => {
      const dayStart = now - (6 - i) * DAY;
      const count = confirmedRegistrations.filter(
        (r) => r.registeredAt >= dayStart && r.registeredAt < dayStart + DAY
      ).length;
      return {
        day: new Date(dayStart).toLocaleDateString("en-US", { weekday: "short" }),
        registrations: count,
      };
    });

    // Interaction breakdown by type
    const interactionTimeline = Array.from({ length: 7 }, (_, i) => {
      const dayStart = now - (6 - i) * DAY;
      const dayInteractions = interactions.filter(
        (r) => r.createdAt >= dayStart && r.createdAt < dayStart + DAY
      );
      return {
        day: new Date(dayStart).toLocaleDateString("en-US", { weekday: "short" }),
        views: dayInteractions.filter((x) => x.interactionType === "viewed").length,
        clicks: dayInteractions.filter((x) => x.interactionType === "clicked").length,
        bookmarks: dayInteractions.filter((x) => x.interactionType === "bookmarked").length,
      };
    });

    const attendanceRate =
      confirmedRegistrations.length > 0
        ? Math.round((attendance.length / confirmedRegistrations.length) * 100)
        : 0;

    const capacityFill =
      event?.capacity > 0
        ? Math.round((confirmedRegistrations.length / event.capacity) * 100)
        : 0;

    const cancelledRegistrations = registrations.filter((r) => r.status === "cancelled");

    return {
      event,
      // Confirmed only (what shows on the dashboard by default)
      registrationCount: confirmedRegistrations.length,
      // Raw total — matches the document count you see in the Convex dashboard
      totalRegistrationCount: registrations.length,
      cancelledCount: cancelledRegistrations.length,
      // Stored denormalized count on the event doc itself
      storedRegistrationCount: event?.registrationCount ?? 0,
      attendanceCount: attendance.length,
      likeCount: likes.length,
      viewCount: event?.viewCount ?? 0,
      bookmarkCount: interactionsMap["bookmarked"] ?? 0,
      shareCount: interactionsMap["shared"] ?? 0,
      attendanceRate,
      capacityFill,
      interactions: interactionsMap,
      registrationTimeline: timeline,
      interactionTimeline,
    };
  },
});

// Click-through rate based on recommendation clicks vs recommendation impressions
export const getRecommendationCTR = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const [views, clicks] = await Promise.all([
      ctx.db
        .query("eventInteractions")
        .withIndex("by_event", (q) => q.eq("eventId", eventId))
        .filter((q) => q.eq(q.field("interactionType"), "viewed"))
        .collect(),
      ctx.db
        .query("eventInteractions")
        .withIndex("by_event", (q) => q.eq("eventId", eventId))
        .filter((q) => q.eq(q.field("interactionType"), "clicked"))
        .collect(),
    ]);

    return {
      views: views.length,
      clicks: clicks.length,
      ctr: views.length > 0 ? (clicks.length / views.length) * 100 : 0,
    };
  },
});

// Get aggregate stats for all organizer events
export const getOrganizerOverallStats = query({
  handler: async (ctx) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    if (!user) return null;

    const myEvents = await ctx.db
      .query("events")
      .withIndex("by_organizer", (q) => q.eq("organizerId", user._id))
      .collect();

    if (myEvents.length === 0) return { totalEvents: 0, totalRegistrations: 0, totalViews: 0, totalLikes: 0 };

    const allEventIds = myEvents.map((e) => e._id);

    // Fetch all registrations and attendance for all events
    const [allRegistrations, allLikes] = await Promise.all([
      Promise.all(
        allEventIds.map((id) =>
          ctx.db.query("registrations").withIndex("by_event", (q) => q.eq("eventId", id)).collect()
        )
      ),
      Promise.all(
        allEventIds.map((id) =>
          ctx.db.query("eventLikes").withIndex("by_event", (q) => q.eq("eventId", id)).collect()
        )
      ),
    ]);

    const totalRegistrations = allRegistrations.flat().filter((r) => r.status === "confirmed").length;
    const totalLikes = allLikes.flat().length;
    const totalViews = myEvents.reduce((sum, e) => sum + (e.viewCount ?? 0), 0);
    const totalCapacity = myEvents.reduce((sum, e) => sum + e.capacity, 0);

    return {
      totalEvents: myEvents.length,
      totalRegistrations,
      totalViews,
      totalLikes,
      totalCapacity,
      avgFillRate: totalCapacity > 0 ? Math.round((totalRegistrations / totalCapacity) * 100) : 0,
    };
  },
});



// Fetch raw event data tables for the "Data View" tab
export const getRawEventData = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    if (!user) return null;

    const event = await ctx.db.get(eventId);
    if (!event || event.organizerId !== user._id) return null;

    const [registrations, attendance, likes, interactions] = await Promise.all([
      ctx.db.query("registrations").withIndex("by_event", (q) => q.eq("eventId", eventId)).order("desc").collect(),
      ctx.db.query("attendance").withIndex("by_event", (q) => q.eq("eventId", eventId)).order("desc").collect(),
      ctx.db.query("eventLikes").withIndex("by_event", (q) => q.eq("eventId", eventId)).order("desc").collect(),
      ctx.db.query("eventInteractions").withIndex("by_event", (q) => q.eq("eventId", eventId)).order("desc").collect(),
    ]);

    return {
      registrations: registrations.map((r) => ({
        _id: r._id,
        attendeeName: r.attendeeName,
        attendeeEmail: r.attendeeEmail,
        status: r.status,
        checkedIn: r.checkedIn,
        checkedInAt: r.checkedInAt ?? null,
        registeredAt: r.registeredAt,
        qrCode: r.qrCode,
      })),
      attendance: attendance.map((a) => ({
        _id: a._id,
        userId: a.userId,
        checkedInAt: a.checkedInAt,
      })),
      likes: likes.map((l) => ({
        _id: l._id,
        userId: l.userId,
        likedAt: l.likedAt,
      })),
      interactions: interactions.slice(0, 200).map((i) => ({
        _id: i._id,
        userId: i.userId,
        interactionType: i.interactionType,
        createdAt: i.createdAt,
      })),
    };
  },
});



