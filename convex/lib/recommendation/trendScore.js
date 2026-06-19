export function computeTrendScore(event, platformAverages) {
  const { avgViews = 50, avgLikes = 10, avgRegistrations = 20 } = platformAverages;
  const viewScore = Math.min(1, (event.viewCount ?? 0) / Math.max(avgViews * 2, 1));
  const likeScore = Math.min(1, (event.likeCount ?? 0) / Math.max(avgLikes * 2, 1));
  const regScore = Math.min(1, (event.registrationCount ?? 0) / Math.max(avgRegistrations * 2, 1));
  return viewScore * 0.2 + likeScore * 0.3 + regScore * 0.5;
}

export function computePlatformAverages(events) {
  if (!events || events.length === 0) return { avgViews: 50, avgLikes: 10, avgRegistrations: 20 };
  const n = events.length;
  return {
    avgViews: events.reduce((sum, e) => sum + (e.viewCount ?? 0), 0) / n,
    avgLikes: events.reduce((sum, e) => sum + (e.likeCount ?? 0), 0) / n,
    avgRegistrations: events.reduce((sum, e) => sum + (e.registrationCount ?? 0), 0) / n,
  };
}
