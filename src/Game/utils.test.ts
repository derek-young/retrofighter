import {arenaSize, craftSize, numColumns} from 'Game/constants';
import {getIsThanksgivingDay, getNextAlley} from './utils';
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
