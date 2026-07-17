import {getMaxPossibleScore} from 'Game/utils';

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
  // Mirrors the threshold rule: Admiral at 90% of the theoretical maximum,
  // each lower rank half as hard, all rounded to the nearest 10.
  const admiralThreshold = Math.round((getMaxPossibleScore() * 0.9) / 10) * 10;
  const thresholds = [32, 16, 8, 4, 2, 1].map(
    divisor => Math.round(admiralThreshold / divisor / 10) * 10,
  );

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
