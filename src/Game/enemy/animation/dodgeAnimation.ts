import {Facing} from 'Game/types';
import {getNextAlley, isVerticalFacing} from 'Game/utils';
import {totalWidth} from 'Game/constants';

import {AnimationProps} from './enemyAnimation';
import {getValidFacings} from './randomAnimation';

function isGridAligned(position: number) {
  return (
    Math.abs(position - Math.round(position / totalWidth) * totalWidth) < 1
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
  const escapeCandidates = getValidFacings(top, left).filter(facing =>
    isVerticalFacing(threatFacing)
      ? !isVerticalFacing(facing)
      : isVerticalFacing(facing),
  );

  if (escapeCandidates.length === 0) {
    return [];
  }

  const escapeFacing =
    escapeCandidates[Math.floor(Math.random() * escapeCandidates.length)];
  const escapePosition = isVerticalFacing(escapeFacing) ? top : left;
  const currentAlley = Math.round(escapePosition / totalWidth);
  const nextAlley =
    escapeFacing === 'S' || escapeFacing === 'E'
      ? currentAlley + 1
      : currentAlley - 1;
  const escapeLeg = {
    nextFacing: escapeFacing,
    toValue: nextAlley * totalWidth,
  };

  // The axis the craft is currently travelling on is the only one that can
  // be off the grid; snap it to the intersection ahead before turning.
  const snapPosition = isVerticalFacing(escapeFacing) ? left : top;

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
