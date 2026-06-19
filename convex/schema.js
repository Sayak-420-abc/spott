import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users: Store profiles, skills, interests, and embedding vector
  users: defineTable({
    // Clerk auth
    email: v.string(),
    tokenIdentifier: v.string(), // Clerk user ID for auth
    name: v.string(),
    imageUrl: v.optional(v.string()),

    // Onboarding
    hasCompletedOnboarding: v.boolean(),

    // Attendee preferences (from onboarding)
    location: v.optional(
      v.object({
        city: v.string(),
        state: v.optional(v.string()), // Added state field
        country: v.string(),
      }),
    ),
    interests: v.optional(v.array(v.string())), // Min 3 categories

    // Organizer tracking (User Subscription)
    freeEventsCreated: v.number(), // Track free event limit (1 free)

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),

    // AI Recommendation Blueprint additions
    role: v.optional(
      v.union(
        v.literal("student"),
        v.literal("organizer"),
        v.literal("volunteer"),
        v.literal("admin"),
        v.literal("provider")
      )
    ),
    department: v.optional(v.string()),
    year: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    embedding: v.optional(v.array(v.float64())), // 768-dim vector from Gemini
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_email", ["email"]),

  // Events: Store event meta, metrics, and event description embedding
  events: defineTable({
    title: v.string(),
    description: v.string(),
    slug: v.string(),

    // Organizer
    organizerId: v.id("users"),
    organizerName: v.string(),

    // Event details
    category: v.string(),
    tags: v.array(v.string()),

    // Date & Time
    startDate: v.number(),
    endDate: v.number(),
    timezone: v.string(),

    // Location
    locationType: v.union(v.literal("physical"), v.literal("online")),
    venue: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.string(),
    state: v.optional(v.string()), // Added state field
    country: v.string(),

    // Capacity & Ticketing
    capacity: v.number(),
    ticketType: v.union(v.literal("free"), v.literal("paid")),
    ticketPrice: v.optional(v.number()), // Paid at event offline
    registrationCount: v.number(),

    // Customization
    coverImage: v.optional(v.string()),
    themeColor: v.optional(v.string()),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),

    // AI Recommendation Blueprint additions
    embedding: v.optional(v.array(v.float64())), // 768-dim vector from Gemini
    viewCount: v.optional(v.number()),
    likeCount: v.optional(v.number()),
    isArchived: v.optional(v.boolean()),
    minMembers: v.optional(v.number()),
  })
    .index("by_organizer", ["organizerId"])
    .index("by_category", ["category"])
    .index("by_start_date", ["startDate"])
    .index("by_slug", ["slug"])
    .index("by_archived", ["isArchived"])
    .searchIndex("search_title", { searchField: "title" }),

  // Friendships: Used to calculate social signals
  friendships: defineTable({
    user1: v.id("users"),
    user2: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_user1", ["user1"])
    .index("by_user2", ["user2"]),

  // Registrations: Stores event signups
  registrations: defineTable({
    eventId: v.id("events"),
    userId: v.id("users"),

    // Attendee info
    attendeeName: v.string(),
    attendeeEmail: v.string(),

    // QR Code for entry
    qrCode: v.string(), // Unique ID for QR

    // Check-in
    checkedIn: v.boolean(),
    checkedInAt: v.optional(v.number()),

    // Status
    status: v.union(v.literal("confirmed"), v.literal("cancelled")),

    registeredAt: v.number(),
  })
    .index("by_event", ["eventId"])
    .index("by_user", ["userId"])
    .index("by_event_user", ["eventId", "userId"])
    .index("by_qr_code", ["qrCode"]),

  // Event Likes: High-intent engagement indicator
  eventLikes: defineTable({
    eventId: v.id("events"),
    userId: v.id("users"),
    likedAt: v.number(),
  })
    .index("by_event", ["eventId"])
    .index("by_user", ["userId"])
    .index("by_event_user", ["eventId", "userId"]),

  // Event Interactions: Raw telemetry for Views, Clicks, and conversions (CTR)
  eventInteractions: defineTable({
    eventId: v.id("events"),
    userId: v.id("users"),
    interactionType: v.union(
      v.literal("viewed"),
      v.literal("clicked"),
      v.literal("shared"),
      v.literal("bookmarked")
    ),
    createdAt: v.number(),
  })
    .index("by_event", ["eventId"])
    .index("by_user", ["userId"])
    .index("by_type", ["interactionType"]),

  // Attendance: Stores check-ins (e.g. via QR scanners) for funnel analysis
  attendance: defineTable({
    eventId: v.id("events"),
    userId: v.id("users"),
    checkedInAt: v.number(),
  })
    .index("by_event", ["eventId"])
    .index("by_user", ["userId"])
    .index("by_event_user", ["eventId", "userId"])
    .index("by_user_event", ["userId", "eventId"]),
});