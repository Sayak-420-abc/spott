import { computeSemanticScore } from "./semanticScore.js";
import { computeSocialScore } from "./socialScore.js";
import { computeTrendScore, computePlatformAverages } from "./trendScore.js";
import { computeDeadlineScore } from "./deadlineScore.js";
import { computeFreshnessScore } from "./freshnessScore.js";
import { computeFinalScore } from "./finalScore.js";
import { generateExplanation } from "./explanationGenerator.js";

export function runRecommendationEngine(user, events, friendIds, eventFriendActivityMap, topN = 10) {
  if (!events || events.length === 0) return [];
  const platformAverages = computePlatformAverages(events);
  const scored = events.map((event) => {
    const eventActivity = eventFriendActivityMap[event._id] ?? { registered: [], liked: [], attended: [] };
    const semantic = computeSemanticScore(user.embedding, event.embedding, user, event);
    const social = computeSocialScore(friendIds, eventActivity);
    const trend = computeTrendScore(event, platformAverages);
    const deadline = computeDeadlineScore(event.registrationDeadline);
    const freshness = computeFreshnessScore(event.createdAt);
    const scores = { semantic, social, trend, deadline, freshness };
    const finalScore = computeFinalScore(scores);
    const friendsRegistered = eventActivity.registered.filter((id) => friendIds.includes(String(id))).length;
    const context = {
      user,
      event,
      friendsRegistered,
      matchedInterests: (user.interests ?? []).filter((interest) =>
        event.tags?.some((tag) => tag.toLowerCase().includes(interest.toLowerCase()))
      ),
      matchedSkills: (user.skills ?? []).filter((skill) =>
        event.description?.toLowerCase().includes(skill.toLowerCase())
      ),
    };
    return {
      event,
      scores,
      finalScore,
      explanation: generateExplanation(scores, context),
    };
  });
  return scored.sort((a, b) => b.finalScore - a.finalScore).slice(0, topN);
}
