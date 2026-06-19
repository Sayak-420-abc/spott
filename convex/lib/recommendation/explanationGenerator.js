export function generateExplanation(scores, context) {
  const { user, event, friendsRegistered, matchedInterests = [], matchedSkills = [] } = context;
  let reason = "You might like this";
  if (matchedInterests.length > 0) {
    reason = `You'd love this because it perfectly matches your passion for ${matchedInterests[0]}!`;
  } else if (matchedSkills.length > 0) {
    reason = `You would like this because it is a great way to grow your ${matchedSkills[0]} skills!`;
  } else if (friendsRegistered > 0) {
    reason = `You would like this because your friends are already registered and going!`;
  }
  return [reason.split(/\s+/).slice(0, 20).join(" ")];
}
