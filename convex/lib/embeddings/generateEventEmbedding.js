export function buildEventEmbeddingText(event) {
  const parts = [];
  if (event.title) parts.push(`Event: ${event.title}`);
  if (event.category) parts.push(`Category: ${event.category}`);
  if (event.description) parts.push(`Description: ${event.description}`);
  if (event.tags?.length) parts.push(`Tags: ${event.tags.join(", ")}`);
  if (event.venue) parts.push(`Venue: ${event.venue}`);
  return parts.join(". ") || event.title;
}
