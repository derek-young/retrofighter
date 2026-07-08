import {
  arenaSize,
  craftSize,
  numColumns,
  startingEnemies,
} from 'Game/constants';
import {
  getIsThanksgivingDay,
  getNextAlley,
  getParSeconds,
  getTimeBonus,
} from './utils';
import {Facing} from './types';

const facings: Facing[] = ['N', 'S', 'E', 'W'];

describe(getNextAlley.name, () => {
  facings.forEach(facing => {
    for (let i = 0; i < arenaSize - craftSize; i += 2) {
      it(`at position of ${i} and facing of ${facing}, returns a value in range`, () => {
        const nextRow = getNextAlley(i, facing);
        expect(nextRow).toBeGreaterThanOrEqual(0);
        expect(nextRow).toBeLessThanOrEqual(numColumns - 1);
      });
    }
  });
});

describe(getParSeconds.name, () => {
  // Enemy counts per level with each cargo ship counting as three kills
  // (it converts into three speeders).
  const expectedParSeconds = [30, 50, 70, 90, 100, 90, 120, 140, 160, 180];

  expectedParSeconds.forEach((parSeconds, epic) => {
    it(`returns ${parSeconds}s for level ${epic}`, () => {
      expect(getParSeconds(epic)).toEqual(parSeconds);
    });
  });

  it('covers every level', () => {
    expect(expectedParSeconds).toHaveLength(startingEnemies.length);
  });
});

describe(getTimeBonus.name, () => {
  it('awards 20 points per second under par', () => {
    // Level 0 par is 30s.
    expect(getTimeBonus(0, 20)).toEqual(200);
  });

  it('awards the full bonus at zero elapsed time', () => {
    expect(getTimeBonus(0, 0)).toEqual(600);
  });

  it('awards nothing at or over par', () => {
    expect(getTimeBonus(0, 30)).toEqual(0);
    expect(getTimeBonus(0, 300)).toEqual(0);
  });

  it('rounds to a multiple of ten', () => {
    expect(getTimeBonus(0, 20.7)).toEqual(190);
    expect(getTimeBonus(0, 29.9) % 10).toEqual(0);
  });
});

describe(getIsThanksgivingDay.name, () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('returns true on Thanksgiving Day 2022', () => {
    jest.setSystemTime(new Date('2022-11-24T12:00:00.000Z'));
    expect(getIsThanksgivingDay()).toEqual(true);
  });

  it('returns true on Thanksgiving Day 2023', () => {
    jest.setSystemTime(new Date('2023-11-23T12:00:00.000Z'));
    expect(getIsThanksgivingDay()).toEqual(true);
  });

  it('returns true on Thanksgiving Day 2024', () => {
    jest.setSystemTime(new Date('2024-11-28T12:00:00.000Z'));
    expect(getIsThanksgivingDay()).toEqual(true);
  });

  it('returns false for non-Thanksgiving days', () => {
    jest.setSystemTime(new Date('2024-11-01T12:00:00.000Z'));
    expect(getIsThanksgivingDay()).toEqual(false);
    jest.setSystemTime(new Date('2024-11-27T12:00:00.000Z'));
    expect(getIsThanksgivingDay()).toEqual(false);
  });
});
