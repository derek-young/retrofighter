import {rankByBestTime, rankByTotalScore} from './leaderboardUtils';

const entries = {
  uidAmy: {displayName: 'A.Amy', totalScore: 900, bestTimes: [25, 0, 80]},
  uidBob: {displayName: 'B.Bob', totalScore: 1200, bestTimes: [30, 45]},
  // Sparse bestTimes come back from Firebase as keyed objects.
  uidCal: {
    displayName: 'C.Cal',
    totalScore: 900,
    bestTimes: {2: 70} as unknown as number[],
  },
  uidNew: {displayName: 'D.New', totalScore: 0, bestTimes: []},
};

describe(rankByTotalScore.name, () => {
  it('ranks players by total score, descending', () => {
    expect(rankByTotalScore(entries).map(row => row.uid)).toEqual([
      'uidBob',
      'uidAmy',
      'uidCal',
    ]);
  });

  it('breaks ties by display name for stable ordering', () => {
    const [, second, third] = rankByTotalScore(entries);

    expect(second.displayName).toEqual('A.Amy');
    expect(third.displayName).toEqual('C.Cal');
  });

  it('excludes players with no score', () => {
    expect(
      rankByTotalScore(entries).find(row => row.uid === 'uidNew'),
    ).toBeUndefined();
  });

  it('returns an empty list when there are no entries', () => {
    expect(rankByTotalScore(null)).toEqual([]);
    expect(rankByTotalScore({})).toEqual([]);
  });
});

describe(rankByBestTime.name, () => {
  it('ranks players by time on the given level, ascending', () => {
    expect(rankByBestTime(entries, 0)).toEqual([
      {uid: 'uidAmy', displayName: 'A.Amy', value: 25, totalScore: 900},
      {uid: 'uidBob', displayName: 'B.Bob', value: 30, totalScore: 1200},
    ]);
  });

  it('excludes players with a 0 or missing time for the level', () => {
    // Amy has 0 on level 1; Cal's sparse object has no entry; New has none.
    expect(rankByBestTime(entries, 1).map(row => row.uid)).toEqual(['uidBob']);
  });

  it('reads sparse bestTimes objects as returned by Firebase', () => {
    expect(rankByBestTime(entries, 2)).toEqual([
      {uid: 'uidCal', displayName: 'C.Cal', value: 70, totalScore: 900},
      {uid: 'uidAmy', displayName: 'A.Amy', value: 80, totalScore: 900},
    ]);
  });

  it('returns an empty list when there are no entries', () => {
    expect(rankByBestTime(null, 0)).toEqual([]);
  });
});
