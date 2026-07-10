import {numColumns, totalWidth} from 'Game/constants';
import {isVerticalFacing} from 'Game/utils';
import {Facing} from 'Game/types';

import dodgeAnimation from './dodgeAnimation';

const verticalFacings: Facing[] = ['N', 'S'];
const horizontalFacings: Facing[] = ['E', 'W'];

function expectGridAligned(value: number) {
  expect(Math.round(value / totalWidth) * totalWidth).toBeCloseTo(value);
}

describe(dodgeAnimation.name, () => {
  it('escapes a vertical threat with a single horizontal leg when grid-aligned', () => {
    for (const threatFacing of verticalFacings) {
      const legs = dodgeAnimation({
        threatFacing,
        currentFacing: 'N',
        top: 5 * totalWidth,
        left: 5 * totalWidth,
      });

      expect(legs).toHaveLength(1);
      expect(isVerticalFacing(legs[0].nextFacing)).toBe(false);
      expectGridAligned(legs[0].toValue);
      expect(Math.abs(legs[0].toValue - 5 * totalWidth)).toBeCloseTo(
        totalWidth,
      );
    }
  });

  it('escapes a horizontal threat with a single vertical leg when grid-aligned', () => {
    for (const threatFacing of horizontalFacings) {
      const legs = dodgeAnimation({
        threatFacing,
        currentFacing: 'E',
        top: 5 * totalWidth,
        left: 5 * totalWidth,
      });

      expect(legs).toHaveLength(1);
      expect(isVerticalFacing(legs[0].nextFacing)).toBe(true);
      expectGridAligned(legs[0].toValue);
      expect(Math.abs(legs[0].toValue - 5 * totalWidth)).toBeCloseTo(
        totalWidth,
      );
    }
  });

  it('snaps to the intersection ahead before turning when mid-alley', () => {
    // Travelling north mid-alley; threat also vertical, so the craft must
    // first reach a grid line on the top axis, then turn E or W.
    const legs = dodgeAnimation({
      threatFacing: 'S',
      currentFacing: 'N',
      top: 5 * totalWidth + 12,
      left: 5 * totalWidth,
    });

    expect(legs).toHaveLength(2);
    expect(legs[0].nextFacing).toBe('N');
    expect(legs[0].toValue).toBeCloseTo(5 * totalWidth);
    expect(isVerticalFacing(legs[1].nextFacing)).toBe(false);
    expectGridAligned(legs[1].toValue);
  });

  it('dodges away from the arena edge only', () => {
    // In the west-most column, a vertical threat can only be dodged east.
    for (let i = 0; i < 25; i++) {
      const legs = dodgeAnimation({
        threatFacing: 'N',
        currentFacing: 'S',
        top: 3 * totalWidth,
        left: 0,
      });

      expect(legs).toHaveLength(1);
      expect(legs[0].nextFacing).toBe('E');
      expect(legs[0].toValue).toBeCloseTo(totalWidth);
    }
  });

  it('keeps escape targets inside the arena', () => {
    for (let alley = 0; alley < numColumns; alley++) {
      for (const threatFacing of [...verticalFacings, ...horizontalFacings]) {
        const legs = dodgeAnimation({
          threatFacing,
          currentFacing: 'S',
          top: alley * totalWidth,
          left: alley * totalWidth,
        });

        for (const leg of legs) {
          expect(leg.toValue).toBeGreaterThanOrEqual(0);
          expect(leg.toValue).toBeLessThanOrEqual(
            (numColumns - 1) * totalWidth,
          );
        }
      }
    }
  });

  it('keeps escape targets inside the arena from off-grid positions', () => {
    // Sweep mid-alley positions across the whole arena, including right by
    // the walls, and repeat to cover the random escape-direction choice.
    const positions = [];

    for (let alley = 0; alley < numColumns - 1; alley++) {
      positions.push(alley * totalWidth + 12);
    }
    positions.push(2, 10, (numColumns - 1) * totalWidth - 2);

    for (let i = 0; i < 25; i++) {
      for (const position of positions) {
        for (const threatFacing of [...verticalFacings, ...horizontalFacings]) {
          const legs = dodgeAnimation({
            threatFacing,
            currentFacing: isVerticalFacing(threatFacing) ? 'S' : 'E',
            top: position,
            left: position,
          });

          for (const leg of legs) {
            expect(leg.toValue).toBeGreaterThanOrEqual(0);
            expect(leg.toValue).toBeLessThanOrEqual(
              (numColumns - 1) * totalWidth,
            );
          }
        }
      }
    }
  });

  it('dodges off-grid near the west wall without leaving the arena', () => {
    // A craft between the wall and alley 1 escaping west lands in alley 0,
    // never at a negative position.
    for (let i = 0; i < 25; i++) {
      const legs = dodgeAnimation({
        threatFacing: 'N',
        currentFacing: 'S',
        top: 3 * totalWidth,
        left: 10,
      });

      expect(legs.length).toBeGreaterThan(0);

      const escapeLeg = legs[legs.length - 1];

      if (escapeLeg.nextFacing === 'W') {
        expect(escapeLeg.toValue).toBeCloseTo(0);
      } else {
        expect(escapeLeg.nextFacing).toBe('E');
        expect(escapeLeg.toValue).toBeCloseTo(totalWidth);
      }
    }
  });
});
