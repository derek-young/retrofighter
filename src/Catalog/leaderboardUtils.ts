import {LeaderboardEntry} from 'database/leaderboard';

export interface RankedRow {
  uid: string;
  displayName: string;
  value: number;
}

// Tie-break by name so rankings are stable across fetches.
function byValueThenName(direction: 1 | -1) {
  return (a: RankedRow, b: RankedRow) =>
    a.value === b.value
      ? a.displayName.localeCompare(b.displayName)
      : (a.value - b.value) * direction;
}

export function rankByTotalScore(
  entries: null | Record<string, LeaderboardEntry>,
): RankedRow[] {
  return Object.entries(entries ?? {})
    .map(([uid, entry]) => ({
      uid,
      displayName: entry.displayName,
      value: entry.totalScore,
    }))
    .filter(row => row.value > 0)
    .sort(byValueThenName(-1));
}

export function rankByBestTime(
  entries: null | Record<string, LeaderboardEntry>,
  level: number,
): RankedRow[] {
  return Object.entries(entries ?? {})
    .map(([uid, entry]) => {
      // Firebase returns sparse arrays as keyed objects; normalize.
      const bestTimes: number[] = Object.assign([], entry.bestTimes ?? []);

      return {
        uid,
        displayName: entry.displayName,
        value: bestTimes[level] ?? 0,
      };
    })
    .filter(row => row.value > 0)
    .sort(byValueThenName(1));
}
