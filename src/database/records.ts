export interface UserRecords {
  scores: number[];
  levelTimes: number[];
  bestTimes: number[];
}

export function getTotalScore(scores: number[]): number {
  return scores.reduce((acc, score) => acc + score, 0);
}

export function mergeLevelCompletion(
  records: UserRecords,
  level: number,
  score: number,
  elapsedSeconds: number,
): null | UserRecords {
  const isNewHighScore = (records.scores[level] ?? 0) < score;
  // A stored 0 means "no recorded time", so any positive time beats it, and
  // an elapsed time of 0 (clock never started) is never recorded.
  const isNewBestTime =
    elapsedSeconds > 0 &&
    (!(records.bestTimes[level] > 0) ||
      elapsedSeconds < records.bestTimes[level]);

  if (!isNewHighScore && !isNewBestTime) {
    return null;
  }

  // Keep the arrays dense with 0 filler so they survive the Firebase
  // round-trip intact.
  const length = Math.max(
    level + 1,
    records.scores.length,
    records.levelTimes.length,
    records.bestTimes.length,
  );
  const dense = (values: number[]) =>
    Array.from({length}, (_, i) => values[i] ?? 0);

  const scores = dense(records.scores);
  const levelTimes = dense(records.levelTimes);
  const bestTimes = dense(records.bestTimes);

  if (isNewHighScore) {
    scores[level] = score;
    // levelTimes stays the time of the high-score run, updated only with it.
    levelTimes[level] = elapsedSeconds;
  }

  if (isNewBestTime) {
    bestTimes[level] = elapsedSeconds;
  }

  return {scores, levelTimes, bestTimes};
}
