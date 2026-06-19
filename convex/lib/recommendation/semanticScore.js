import { cosineSimilarity } from "../embeddings/cosineSimilarity.js";

export function computeSemanticScore(userEmbedding, eventEmbedding, user = null, event = null) {
  if (userEmbedding && eventEmbedding && userEmbedding.length === eventEmbedding.length) {
    const rawSim = cosineSimilarity(userEmbedding, eventEmbedding);
    const minSim = 0.58;
    const maxSim = 0.78;
    let stretched = (rawSim - minSim) / (maxSim - minSim);
    stretched = Math.max(0, Math.min(1, stretched));
    return 0.15 + stretched * (0.98 - 0.15); // scaled to [0.15, 0.98]
  }
  // Fallback keyword match
  if (!user || !event) return 0.3;
  const userInterests = (user.interests ?? []).map(x => x.toLowerCase());
  const userSkills = (user.skills ?? []).map(x => x.toLowerCase());
  const eventTags = (event.tags ?? []).map(x => x.toLowerCase());
  const title = (event.title ?? "").toLowerCase();
  const desc = (event.description ?? "").toLowerCase();
  const category = (event.category ?? "").toLowerCase();
  let matches = 0;
  let totalWeights = 0;
  if (userInterests.length > 0) {
    totalWeights += 1.0;
    let intMatches = 0;
    for (const interest of userInterests) {
      if (eventTags.some(tag => tag.includes(interest) || interest.includes(tag))) intMatches += 1.0;
      else if (title.includes(interest) || desc.includes(interest)) intMatches += 0.7;
      else if (category.includes(interest)) intMatches += 0.6;
    }
    matches += (intMatches / userInterests.length) * 1.0;
  }
  if (userSkills.length > 0) {
    totalWeights += 1.0;
    let skillMatches = 0;
    for (const skill of userSkills) {
      if (eventTags.some(tag => tag.includes(skill) || skill.includes(tag))) skillMatches += 0.8;
      else if (desc.includes(skill)) skillMatches += 0.6;
    }
    matches += (skillMatches / userSkills.length) * 1.0;
  }
  let score = totalWeights > 0 ? matches / totalWeights : 0;
  return 0.12 + score * (0.95 - 0.12);
}
