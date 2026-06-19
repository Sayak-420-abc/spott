export function computeFreshnessScore(createdAt) {
  const ageMs = Date.now() - createdAt;
  if (ageMs < 0) return 1.0;
  const halfLife = 7 * 86400000;
  const decay = Math.exp(-ageMs / halfLife);
  return 0.05 + decay * 0.95;
}
