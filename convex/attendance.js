import { v } from "convex/values";
import { query } from "./_generated/server";

export const getEventAttendance = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    return await ctx.db
      .query("attendance")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect();
  },
});

export const getUserAttendance = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const attendance = await ctx.db
      .query("attendance")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    
    return await Promise.all(
      attendance.map(async (a) => {
        const event = await ctx.db.get(a.eventId);
        return {
          ...a,
          event,
        };
      })
    );
  },
});
