import {getDisplayName, getRankIndex} from './utils';

describe(getDisplayName.name, () => {
  it('returns first initial dot last if both exist', () => {
    expect(getDisplayName({displayName: 'Derek Young'})).toEqual('D.Young');
  });

  it('returns only first if last does not exist', () => {
    expect(getDisplayName({displayName: 'Young'})).toEqual('Young');
  });

  it('returns "Anonymous" if displayName or user does not exist', () => {
    expect(getDisplayName({displayName: ''})).toEqual('Anonymous');
    expect(getDisplayName({displayName: undefined})).toEqual('Anonymous');
    expect(getDisplayName({displayName: null})).toEqual('Anonymous');
    expect(getDisplayName({})).toEqual('Anonymous');
    expect(getDisplayName(undefined)).toEqual('Anonymous');
    expect(getDisplayName(null)).toEqual('Anonymous');
  });
});

describe(getRankIndex.name, () => {
  const tests = [
    [0, 0],
    [1, 0],
    [999, 0],
    [1000, 1],
    [1001, 1],
    [1999, 1],
    [2000, 2],
    [2001, 2],
    [3999, 2],
    [4000, 3],
    [4001, 3],
    [7999, 3],
    [8000, 4],
    [8001, 4],
    [15999, 4],
    [16000, 5],
    [16001, 5],
    [31999, 5],
    [32000, 6],
    [32001, 6],
    [999999, 6],
  ];

  for (let i = 0; i < tests.length; i++) {
    const [score, expectedRankIndex] = tests[i];
    it(`for score ${score}, expected rank index of ${expectedRankIndex}`, () => {
      expect(getRankIndex(score)).toEqual(expectedRankIndex);
    });
  }
});
