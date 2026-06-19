export function buildUserEmbeddingText(user, likedEvents = [], registeredEvents = [], attendedEvents = []) {
  const parts = [];
  if (user.interests?.length) parts.push(`Interests: ${user.interests.join(", ")}`);
  if (user.skills?.length) parts.push(`Skills: ${user.skills.join(", ")}`);
  if (user.department) parts.push(`Department: ${user.department}`);
  if (likedEvents.length) parts.push(`Liked events: ${likedEvents.map((e) => e.title).join(", ")}`);
  if (registeredEvents.length) parts.push(`Registered for: ${registeredEvents.map((e) => e.title).join(", ")}`);
  if (attendedEvents.length) parts.push(`Attended: ${attendedEvents.map((e) => e.title).join(", ")}`);
  return parts.join(". ") || "General student interested in campus events";
}
