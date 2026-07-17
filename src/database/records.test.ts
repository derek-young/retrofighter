import {getTotalScore, mergeLevelCompletion} from './records';

describe(getTotalScore.name, () => {
  it('sums scores', () => {
    expect(getTotalScore([100, 250, 0, 40])).toEqual(390);
  });

  it('returns 0 for an empty array', () => {
    expect(getTotalScore([])).toEqual(0);
  });
});

describe(mergeLevelCompletion.name, () => {
  const records = {
    scores: [500, 300],
    levelTimes: [25, 40],
    bestTimes: [20, 40],
  };

  it('returns null when neither the score nor the time improves', () => {
    expect(mergeLevelCompletion(records, 0, 500, 30)).toBeNull();
    expect(mergeLevelCompletion(records, 0, 400, 20)).toBeNull();
  });

  it('updates scores and levelTimes together on a new high score', () => {
    // Slower than the best time, so bestTimes must not change.
    expect(mergeLevelCompletion(records, 0, 600, 28)).toEqual({
      scores: [600, 300],
      levelTimes: [28, 40],
      bestTimes: [20, 40],
    });
  });

  it('updates only bestTimes on a faster but lower-score run', () => {
    expect(mergeLevelCompletion(records, 0, 400, 15)).toEqual({
      scores: [500, 300],
      levelTimes: [25, 40],
      bestTimes: [15, 40],
    });
  });

  it('updates all three on a faster high-score run', () => {
    expect(mergeLevelCompletion(records, 1, 350, 35)).toEqual({
      scores: [500, 350],
      levelTimes: [25, 35],
      bestTimes: [20, 35],
    });
  });

  it('sets all three on the first completion of a level', () => {
    expect(mergeLevelCompletion(records, 2, 200, 60)).toEqual({
      scores: [500, 300, 200],
      levelTimes: [25, 40, 60],
      bestTimes: [20, 40, 60],
    });
  });

  it('backfills skipped levels with 0 so arrays stay dense', () => {
    expect(
      mergeLevelCompletion(
        {scores: [], levelTimes: [], bestTimes: []},
        2,
        200,
        60,
      ),
    ).toEqual({
      scores: [0, 0, 200],
      levelTimes: [0, 0, 60],
      bestTimes: [0, 0, 60],
    });
  });

  it('treats a stored 0 best time as "no time", beaten by any positive time', () => {
    const zeroTime = {scores: [500], levelTimes: [0], bestTimes: [0]};

    expect(mergeLevelCompletion(zeroTime, 0, 100, 9999)).toEqual({
      scores: [500],
      levelTimes: [0],
      bestTimes: [9999],
    });
  });

  it('never records an elapsed time of 0', () => {
    expect(
      mergeLevelCompletion(
        {scores: [], levelTimes: [], bestTimes: []},
        0,
        0,
        0,
      ),
    ).toBeNull();

    // A 0-elapsed high score still records, but not as a best time.
    expect(mergeLevelCompletion(records, 0, 600, 0)).toEqual({
      scores: [600, 300],
      levelTimes: [0, 40],
      bestTimes: [20, 40],
    });
  });

  it('does not mutate the input records', () => {
    mergeLevelCompletion(records, 0, 600, 15);

    expect(records).toEqual({
      scores: [500, 300],
      levelTimes: [25, 40],
      bestTimes: [20, 40],
    });
  });
});
