import {
  getCumulativeKillPoints,
  getFullClearScore,
  getHalfParTimeBonus,
  getLevelCount,
} from 'Game/utils';

import {
  formatScore,
  formatTime,
  getDisplayName,
  getRankIndex,
} from './utils';

describe(formatScore.name, () => {
  it('adds comma separators', () => {
    expect(formatScore(0)).toEqual('0');
    expect(formatScore(950)).toEqual('950');
    expect(formatScore(12500)).toEqual('12,500');
    expect(formatScore(1250000)).toEqual('1,250,000');
  });
});

describe(formatTime.name, () => {
  it('formats seconds as m:ss', () => {
    expect(formatTime(0)).toEqual('0:00');
    expect(formatTime(9)).toEqual('0:09');
    expect(formatTime(61)).toEqual('1:01');
    expect(formatTime(600)).toEqual('10:00');
  });

  it('floors fractional seconds', () => {
    expect(formatTime(78.4)).toEqual('1:18');
  });
});

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
  // Mirrors the threshold rule: Lieutenant … Captain at 1/5 … 4/5 level
  // completion, Fleet Captain at a full clear, Admiral at a full clear with
  // every level at half par. All rounded to the nearest 10.
  const roundToTen = (score: number) => Math.round(score / 10) * 10;
  const levelCount = getLevelCount();
  const thresholds = [
    ...[1, 2, 3, 4].map(step =>
      roundToTen(
        getCumulativeKillPoints(Math.round((step / 5) * levelCount) - 1),
      ),
    ),
    roundToTen(getFullClearScore()),
    roundToTen(getFullClearScore() + getHalfParTimeBonus()),
  ];

  it('anchors Fleet Captain at a full clear and Admiral at half par', () => {
    expect(thresholds).toEqual([1700, 6200, 12600, 23000, 40250, 53100]);
  });

  it('starts at the lowest rank', () => {
    expect(getRankIndex(0)).toEqual(0);
    expect(getRankIndex(1)).toEqual(0);
  });

  thresholds.forEach((threshold, index) => {
    it(`promotes to rank index ${index + 1} at exactly ${threshold}`, () => {
      expect(getRankIndex(threshold - 1)).toEqual(index);
      expect(getRankIndex(threshold)).toEqual(index + 1);
      expect(getRankIndex(threshold + 1)).toEqual(index + 1);
    });
  });

  it('caps at the highest rank', () => {
    expect(getRankIndex(999999)).toEqual(6);
  });
});
