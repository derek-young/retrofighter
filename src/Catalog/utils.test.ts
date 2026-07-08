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
    [1124, 0],
    [1125, 1],
    [1126, 1],
    [2249, 1],
    [2250, 2],
    [2251, 2],
    [4499, 2],
    [4500, 3],
    [4501, 3],
    [8999, 3],
    [9000, 4],
    [9001, 4],
    [17999, 4],
    [18000, 5],
    [18001, 5],
    [35999, 5],
    [36000, 6],
    [36001, 6],
    [999999, 6],
  ];

  for (let i = 0; i < tests.length; i++) {
    const [score, expectedRankIndex] = tests[i];
    it(`for score ${score}, expected rank index of ${expectedRankIndex}`, () => {
      expect(getRankIndex(score)).toEqual(expectedRankIndex);
    });
  }
});
