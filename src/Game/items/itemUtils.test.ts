import {numColumns, totalWidth} from 'Game/constants';

import {getItemSpawnPosition} from './itemUtils';

const maxAlley = (numColumns - 1) * totalWidth;

describe(getItemSpawnPosition.name, () => {
  it('returns a grid intersection inside the arena', () => {
    for (let i = 0; i < 50; i++) {
      const {top, left} = getItemSpawnPosition([{top: 0, left: 0}]);

      expect(top).toBeGreaterThanOrEqual(0);
      expect(top).toBeLessThanOrEqual(maxAlley);
      expect(left).toBeGreaterThanOrEqual(0);
      expect(left).toBeLessThanOrEqual(maxAlley);
      expect(Math.round(top / totalWidth) * totalWidth).toBeCloseTo(top);
      expect(Math.round(left / totalWidth) * totalWidth).toBeCloseTo(left);
    }
  });

  it('spawns far away from a single craft', () => {
    for (let i = 0; i < 50; i++) {
      const {top, left} = getItemSpawnPosition([{top: 0, left: 0}]);

      // The far corner region maximizes Manhattan distance from the origin.
      expect(top + left).toBeGreaterThanOrEqual(2 * maxAlley * 0.9);
    }
  });

  it('maximizes the minimum distance to every craft', () => {
    // Crafts in all four corners push the best spawn toward the center.
    const corners = [
      {top: 0, left: 0},
      {top: 0, left: maxAlley},
      {top: maxAlley, left: 0},
      {top: maxAlley, left: maxAlley},
    ];

    for (let i = 0; i < 50; i++) {
      const {top, left} = getItemSpawnPosition(corners);
      const center = maxAlley / 2;

      expect(Math.abs(top - center)).toBeLessThanOrEqual(totalWidth * 1.5);
      expect(Math.abs(left - center)).toBeLessThanOrEqual(totalWidth * 1.5);
    }
  });
});
