export function computeSocialScore(friendIds, eventFriendActivity) {
  if (!friendIds || friendIds.length === 0) return 0;
  const { registered = [], liked = [], attended = [] } = eventFriendActivity;
  const friendSet = new Set(friendIds.map(String));
  const friendsRegistered = registered.filter((id) => friendSet.has(String(id))).length;
  const friendsLiked = liked.filter((id) => friendSet.has(String(id))).length;
  const friendsAttended = attended.filter((id) => friendSet.has(String(id))).length;
  const rawSignal = friendsRegistered * 3 + friendsLiked * 2 + friendsAttended * 4;
  if (rawSignal === 0) return 0;
  const maxExpected = 20;
  return Math.min(1, Math.log1p(rawSignal) / Math.log1p(maxExpected));
}
