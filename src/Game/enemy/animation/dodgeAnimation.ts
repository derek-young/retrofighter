import {Facing} from 'Game/types';
import {getNextAlley, isVerticalFacing} from 'Game/utils';
import {numColumns, totalWidth} from 'Game/constants';

import {AnimationProps} from './enemyAnimation';
import {getValidFacings} from './randomAnimation';

function isGridAligned(position: number) {
  return (
    Math.abs(position - Math.round(position / totalWidth) * totalWidth) < 1
  );
}

/**
 * The adjacent alley in the escape direction, clamped to the arena. From an
 * aligned position that is the neighboring alley; from an off-grid position
 * it is the nearest alley on that side.
 */
function getEscapeAlley(escapeFacing: Facing, escapePosition: number) {
  const alley = escapePosition / totalWidth;

  if (escapeFacing === 'S' || escapeFacing === 'E') {
    return Math.min(
      numColumns - 1,
      isGridAligned(escapePosition) ? Math.round(alley) + 1 : Math.ceil(alley),
    );
  }

  return Math.max(
    0,
    isGridAligned(escapePosition) ? Math.round(alley) - 1 : Math.floor(alley),
  );
}

/**
 * An escape route out of an incoming missile's alley: a leg perpendicular to
 * the threat into an adjacent alley, preceded when necessary by a leg that
 * finishes travelling to the next grid intersection so the craft never cuts
 * through a wall. Returns no legs when the arena edge leaves nowhere to go.
 */
function dodgeAnimation({
  threatFacing,
  currentFacing,
  top,
  left,
}: {
  threatFacing: Facing;
  currentFacing: Facing;
  top: number;
  left: number;
}): AnimationProps[] {
  const escapePosition = isVerticalFacing(threatFacing) ? left : top;
  const escapeCandidates = getValidFacings(top, left)
    .filter(facing =>
      isVerticalFacing(threatFacing)
        ? !isVerticalFacing(facing)
        : isVerticalFacing(facing),
    )
    .map(facing => ({
      nextFacing: facing,
      toValue: getEscapeAlley(facing, escapePosition) * totalWidth,
    }))
    // A target clamped back onto the craft's own position doesn't leave the
    // missile's lane and is no escape.
    .filter(({toValue}) => Math.abs(toValue - escapePosition) >= 1);

  if (escapeCandidates.length === 0) {
    return [];
  }

  const escapeLeg =
    escapeCandidates[Math.floor(Math.random() * escapeCandidates.length)];

  // The axis the craft is currently travelling on is the only one that can
  // be off the grid; snap it to the intersection ahead before turning.
  const snapPosition = isVerticalFacing(threatFacing) ? top : left;

  if (isGridAligned(snapPosition)) {
    return [escapeLeg];
  }

  return [
    {
      nextFacing: currentFacing,
      toValue: getNextAlley(snapPosition, currentFacing) * totalWidth,
    },
    escapeLeg,
  ];
}

export default dodgeAnimation;
