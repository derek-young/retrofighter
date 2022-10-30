import {arenaSize, craftSize, numColumns} from 'Game/gameConstants';
import {getNextAlley} from './utils';
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
