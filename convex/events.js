import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new event
export const createEvent = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.string(),
    tags: v.array(v.string()),

    startDate: v.number(),
    endDate: v.number(),
    timezone: v.string(),

    locationType: v.union(v.literal("physical"), v.literal("online")),
    venue: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.string(),
    state: v.optional(v.string()),
    country: v.string(),

    capacity: v.number(),
    ticketType: v.union(v.literal("free"), v.literal("paid")),
    ticketPrice: v.optional(v.number()),
    coverImage: v.optional(v.string()),
    themeColor: v.optional(v.string()),
    
  },
  handler: async (ctx, args) => {
    try {
      const user = await ctx.runQuery(internal.users.getCurrentUser);

     

      // Force default color for Free users
      const themeColor = args.themeColor;

      // Generate slug from title
      const slug = args.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      // Create event
      const eventId = await ctx.db.insert("events", {
        ...args,
        themeColor, // Use validated color
        slug: `${slug}-${Date.now()}`,
        organizerId: user._id,
        organizerName: user.name,
        registrationCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Update user's free event count
      await ctx.db.patch(user._id, {
        freeEventsCreated: user.freeEventsCreated + 1,
      });

      return eventId;
    } catch (error) {
      throw new Error(`Failed to create event: ${error.message}`);
    }
  },
});

// Get event by slug
export const getEventBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const event = await ctx.db
      .query("events")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    return event;
  },
});

// Get events by organizer
export const getMyEvents = query({
  handler: async (ctx) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    if (!user) return [];

    const events = await ctx.db
      .query("events")
      .withIndex("by_organizer", (q) => q.eq("organizerId", user._id))
      .order("desc")
      .collect();

    return events;
  },
});

// Delete event
export const deleteEvent = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Check if user is the organizer
    if (event.organizerId !== user._id) {
      throw new Error("You are not authorized to delete this event");
    }

    // Delete all registrations for this event
    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    for (const registration of registrations) {
      await ctx.db.delete(registration._id);
    }

    // Delete the event
    await ctx.db.delete(args.eventId);

    // Update free event count if it was a free event
    if (event.ticketType === "free" && user.freeEventsCreated > 0) {
      await ctx.db.patch(user._id, {
        freeEventsCreated: user.freeEventsCreated - 1,
      });
    }

    return { success: true };
  },
});

export const listActiveEvents = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("events")
      .collect();
  },
});

export const getEventById = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    return await ctx.db.get(eventId);
  },
});

export const updateEvent = mutation({
  args: {
    eventId: v.id("events"),
    embedding: v.optional(v.array(v.float64())),
    viewCount: v.optional(v.number()),
    likeCount: v.optional(v.number()),
    registrationCount: v.optional(v.number()),
    isArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { eventId, ...patchData } = args;
    await ctx.db.patch(eventId, patchData);
  },
});

export const isLiked = query({
  args: {
    eventId: v.id("events"),
    userId: v.id("users"),
  },
  handler: async (ctx, { eventId, userId }) => {
    const like = await ctx.db
      .query("eventLikes")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", eventId).eq("userId", userId)
      )
      .unique();
    return !!like;
  },
});

export const toggleLikeEvent = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    if (!user) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("eventLikes")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", eventId).eq("userId", user._id)
      )
      .unique();

    const event = await ctx.db.get(eventId);
    if (!event) throw new Error("Event not found");

    const currentLikeCount = event.likeCount ?? 0;

    if (existing) {
      await ctx.db.delete(existing._id);
      await ctx.db.patch(eventId, {
        likeCount: Math.max(0, currentLikeCount - 1),
      });
      return { liked: false };
    } else {
      await ctx.db.insert("eventLikes", {
        eventId,
        userId: user._id,
        likedAt: Date.now(),
      });
      await ctx.db.patch(eventId, {
        likeCount: currentLikeCount + 1,
      });
      return { liked: true };
    }
  },
});

export const getEventLikes = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    return await ctx.db
      .query("eventLikes")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect();
  },
});
