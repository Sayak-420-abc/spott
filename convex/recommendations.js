import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { runRecommendationEngine } from "./lib/recommendation/recommendationEngine.js";
import { buildUserEmbeddingText } from "./lib/embeddings/generateUserEmbedding.js";
import { buildEventEmbeddingText } from "./lib/embeddings/generateEventEmbedding.js";

// Main API call
export const getRecommendations = action({
  args: {
    userId: v.optional(v.id("users")),
    limit: v.optional(v.number()),
    overrideInterests: v.optional(v.array(v.string())),
    overrideSkills: v.optional(v.array(v.string())),
  },
  handler: async (ctx, { userId, limit = 10, overrideInterests, overrideSkills }) => {
    const genAIKey = process.env.GEMINI_API_KEY;
    
    let user;
    if (userId) {
      user = await ctx.runQuery(api.users.getUserById, { userId });
    } else {
      user = await ctx.runQuery(api.users.getCurrentUser);
    }
    if (!user) throw new Error("User not found or not authenticated");
    const actualUserId = user._id;

    // Apply temporary preference overrides
    if (overrideInterests) {
      user = { ...user, interests: overrideInterests };
    }
    if (overrideSkills) {
      user = { ...user, skills: overrideSkills };
    }

    // Generate custom in-memory embedding if overrides are provided, otherwise trigger self-healing
    if (genAIKey && (overrideInterests || overrideSkills || !user.embedding || user.embedding.length === 0)) {
      const [regs, attendance] = await Promise.all([
        ctx.runQuery(api.registrations.getUserRegistrations, { userId: actualUserId }),
        ctx.runQuery(api.attendance.getUserAttendance, { userId: actualUserId }),
      ]);
      const text = buildUserEmbeddingText(
        user,
        [],
        regs.map(r => r.event).filter(Boolean),
        attendance.map(a => a.event).filter(Boolean)
      );
      try {
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(genAIKey);
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const result = await model.embedContent(text);
        user = { ...user, embedding: result.embedding.values };
      } catch (err) {
        console.error("Custom user embedding generation failed", err);
      }
    } else if (genAIKey && (!user.embedding || user.embedding.length === 0)) {
      await ctx.runAction(api.recommendations.generateAndStoreUserEmbedding, { userId: actualUserId });
      user = await ctx.runQuery(api.users.getUserById, { userId: actualUserId });
    }

    const [events, userRegs] = await Promise.all([
      ctx.runQuery(api.events.listActiveEvents, {}),
      ctx.runQuery(api.registrations.getUserRegistrations, { userId: actualUserId }),
    ]);

    const registeredEventIds = new Set(userRegs.map((r) => r.eventId));
    let activeEvents = events.filter((e) => {
      const deadline = e.registrationDeadline ?? e.startDate;
      return !e.isArchived && deadline > Date.now() && !registeredEventIds.has(e._id);
    });

    if (activeEvents.length === 0) return [];

    // Self-healing: generate event embeddings if missing
    if (genAIKey) {
      let generatedAny = false;
      for (const event of activeEvents) {
        if (!event.embedding || event.embedding.length === 0) {
          await ctx.runAction(api.recommendations.generateAndStoreEventEmbedding, { eventId: event._id });
          generatedAny = true;
        }
      }
      if (generatedAny) {
        const freshEvents = await ctx.runQuery(api.events.listActiveEvents, {});
        activeEvents = freshEvents.filter((e) => {
          const deadline = e.registrationDeadline ?? e.startDate;
          return !e.isArchived && deadline > Date.now() && !registeredEventIds.has(e._id);
        });
      }
    }

    const friendIds = await ctx.runQuery(api.friendships.getFriendIds, { userId: actualUserId });
    const eventFriendActivityMap = {};
    const registeredFriendsMap = {};

    for (const event of activeEvents) {
      const [regs, likes, attendance] = await Promise.all([
        ctx.runQuery(api.registrations.getEventRegistrationsForRecommendations, { eventId: event._id }),
        ctx.runQuery(api.events.getEventLikes, { eventId: event._id }),
        ctx.runQuery(api.attendance.getEventAttendance, { eventId: event._id }),
      ]);

      eventFriendActivityMap[event._id] = {
        registered: regs.map((r) => r.userId),
        liked: likes.map((l) => l.userId),
        attended: attendance.map((a) => a.userId),
      };

      registeredFriendsMap[event._id] = regs
        .filter((r) => r.user && friendIds.includes(String(r.userId)))
        .map((r) => ({ _id: r.user._id, name: r.user.name, email: r.user.email, image: r.user.image }));
    }

    const recommendationsInputEvents = activeEvents.map(e => ({
      ...e,
      registrationDeadline: e.registrationDeadline ?? e.startDate
    }));

    const rawRecommendations = runRecommendationEngine(user, recommendationsInputEvents, friendIds, eventFriendActivityMap, limit);
    const recommendations = rawRecommendations.map((rec) => ({
      ...rec,
      registeredFriends: registeredFriendsMap[rec.event._id] || [],
    }));

    // Generate personalized advice pitch using Gemini-2.5-Flash
    if (genAIKey && recommendations.length > 0) {
      try {
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(genAIKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        await Promise.all(
          recommendations.slice(0, 3).map(async (rec) => {
            const semanticPercent = Math.round(rec.scores.semantic * 100);
            const prompt = `
              You are Spott's intelligent event advisor. Write a personalized, highly engaging, one-sentence recommendation message explaining why this campus event is a great fit for the student.
              Student Profile:
              - Name: ${user.name}
              - Department: ${user.department || "General"}
              - Interests: ${user.interests?.join(", ") || "None"}
              - Skills: ${user.skills?.join(", ") || "None"}
              Event Details:
              - Title: ${rec.event.title}
              - Category: ${rec.event.category}
              - Description: ${rec.event.description}
              AI Scoring Analysis:
              - Semantic Alignment Match: ${semanticPercent}%
              Requirements:
              - Keep the response to exactly one sentence.
              - Sound encouraging and conversational.
              - Reference their interests/skills/department AND the semantic match percentage in a natural way.
            `;
            try {
              const response = await model.generateContent(prompt);
              rec.aiMessage = response.response.text().trim().replace(/^"|"$/g, '');
            } catch (err) {
              console.error("Gemini advice failed", err);
            }
          })
        );
      } catch (err) {
        console.error("Gemini initialization failed", err);
      }
    }
    return recommendations;
  },
});

// Event embedding action
export const generateAndStoreEventEmbedding = action({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const event = await ctx.runQuery(api.events.getEventById, { eventId });
    if (!event) return;
    const text = buildEventEmbeddingText(event);
    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
      const result = await model.embedContent(text);
      await ctx.runMutation(api.events.updateEvent, { eventId, embedding: result.embedding.values });
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false };
    }
  },
});

// User embedding action
export const generateAndStoreUserEmbedding = action({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.runQuery(api.users.getUserById, { userId });
    if (!user) return;
    const [regs, attendance] = await Promise.all([
      ctx.runQuery(api.registrations.getUserRegistrations, { userId }),
      ctx.runQuery(api.attendance.getUserAttendance, { userId }),
    ]);
    const text = buildUserEmbeddingText(
      user,
      [],
      regs.map(r => r.event).filter(Boolean),
      attendance.map(a => a.event).filter(Boolean)
    );
    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
      const result = await model.embedContent(text);
      await ctx.runMutation(api.users.updateUserEmbedding, { userId, embedding: result.embedding.values });
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false };
    }
  },
});
