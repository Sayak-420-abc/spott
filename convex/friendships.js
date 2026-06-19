import { v } from "convex/values";
import { query } from "./_generated/server";

export const getFriendIds = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const friendships1 = await ctx.db
      .query("friendships")
      .withIndex("by_user1", (q) => q.eq("user1", userId))
      .collect();
    
    const friendships2 = await ctx.db
      .query("friendships")
      .withIndex("by_user2", (q) => q.eq("user2", userId))
      .collect();
    
    const friendIds = new Set();
    friendships1.forEach((f) => friendIds.add(f.user2.toString()));
    friendships2.forEach((f) => friendIds.add(f.user1.toString()));
    
    return Array.from(friendIds);
  },
});
