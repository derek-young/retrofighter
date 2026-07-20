import {totalWidth} from 'Game/constants';
import {Facing} from 'Game/types';

import {getSnapToGridLeg, isGridAligned} from './enemyAnimation';

const verticalFacings: Facing[] = ['N', 'S'];
const horizontalFacings: Facing[] = ['E', 'W'];

describe(isGridAligned.name, () => {
  it('accepts positions within a pixel of an intersection', () => {
    expect(isGridAligned(5 * totalWidth)).toBe(true);
    expect(isGridAligned(5 * totalWidth + 0.5)).toBe(true);
    expect(isGridAligned(5 * totalWidth - 0.5)).toBe(true);
  });

  it('rejects mid-alley positions', () => {
    expect(isGridAligned(5 * totalWidth + 12)).toBe(false);
    expect(isGridAligned(totalWidth / 2)).toBe(false);
  });
});

describe(getSnapToGridLeg.name, () => {
  it('returns no leg when continuing on the same axis', () => {
    // Off-grid on the travel axis, but the planned move continues along it
    // to an aligned target, so no snap is needed.
    for (const [currFacing, nextFacing] of [
      ['N', 'S'],
      ['E', 'E'],
    ] as [Facing, Facing][]) {
      expect(
        getSnapToGridLeg({
          currFacing,
          nextFacing,
          top: 5 * totalWidth + 12,
          left: 5 * totalWidth + 12,
        }),
      ).toBeNull();
    }
  });

  it('returns no leg when turning from a grid intersection', () => {
    for (const currFacing of [...verticalFacings, ...horizontalFacings]) {
      for (const nextFacing of [...verticalFacings, ...horizontalFacings]) {
        expect(
          getSnapToGridLeg({
            currFacing,
            nextFacing,
            top: 5 * totalWidth,
            left: 5 * totalWidth,
          }),
        ).toBeNull();
      }
    }
  });

  it('finishes travelling to the intersection ahead before a turn', () => {
    // Moving east mid-alley and turning south: first continue east to the
    // next column, leaving the turn for the re-plan that follows.
    const leg = getSnapToGridLeg({
      currFacing: 'E',
      nextFacing: 'S',
      top: 5 * totalWidth,
      left: 5 * totalWidth + 12,
    });

    expect(leg).toEqual({nextFacing: 'E', toValue: 6 * totalWidth});
  });

  it('snaps backward-travelling facings to the intersection ahead', () => {
    const northLeg = getSnapToGridLeg({
      currFacing: 'N',
      nextFacing: 'W',
      top: 5 * totalWidth + 12,
      left: 5 * totalWidth,
    });

    expect(northLeg).toEqual({nextFacing: 'N', toValue: 5 * totalWidth});

    const westLeg = getSnapToGridLeg({
      currFacing: 'W',
      nextFacing: 'S',
      top: 5 * totalWidth,
      left: 5 * totalWidth + 12,
    });

    expect(westLeg).toEqual({nextFacing: 'W', toValue: 5 * totalWidth});
  });

  it('only ever snaps along the current travel axis', () => {
    // The cross axis (here, top while travelling east) is aligned by
    // construction; an off-grid value there must not trigger a snap on it.
    const leg = getSnapToGridLeg({
      currFacing: 'E',
      nextFacing: 'N',
      top: 5 * totalWidth + 12,
      left: 5 * totalWidth,
    });

    expect(leg).toBeNull();
  });
});
