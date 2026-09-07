export function scoreAnswer(
  { coeff, digits, timeMs, combo }: { coeff: number; digits: number; timeMs: number; combo: number },
): { points: number; nextCombo: number } {
  const baseDifficultyScore = 1000 * coeff * digits;
  const speedFactor = Math.min(2, Math.max(0.1, 1500 / (timeMs + 200)));
  const nextCombo = timeMs < 1500 ? combo + 1 : 0;
  const multiplier = 1 + nextCombo * 0.2;
  const points = Math.floor(baseDifficultyScore * speedFactor * multiplier);
  return { points, nextCombo };
}
