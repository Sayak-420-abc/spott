export function computeDeadlineScore(registrationDeadline) {
  const timeLeft = registrationDeadline - Date.now();
  if (timeLeft <= 0) return 0;
  const DAY = 86400000;
  if (timeLeft <= DAY) return 1.0;
  const totalDays = timeLeft / DAY;
  return 1 / (1 + Math.pow(totalDays / 3, 2));
}
