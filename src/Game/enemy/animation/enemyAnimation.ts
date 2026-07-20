import {getNextAlley, isVerticalFacing} from 'Game/utils';
import {Facing} from 'Game/types';
import {alleyWidth, totalWidth} from 'Game/constants';

export interface AnimationProps {
  nextFacing: Facing;
  toValue: number;
}

export function isGridAligned(position: number) {
  return (
    Math.abs(position - Math.round(position / totalWidth) * totalWidth) < 1
  );
}

/**
 * The leg a craft must run before it may turn onto the other axis: when its
 * current travel axis was stopped between alleys (a mid-segment re-plan),
 * turning immediately would leave it riding between rows or columns.
 * Returns a leg that finishes travelling to the next grid intersection, or
 * null when the turn is already safe.
 */
export function getSnapToGridLeg({
  currFacing,
  nextFacing,
  top,
  left,
}: {
  currFacing: Facing;
  nextFacing: Facing;
  top: number;
  left: number;
}): AnimationProps | null {
  if (isVerticalFacing(nextFacing) === isVerticalFacing(currFacing)) {
    return null;
  }

  const travelPosition = isVerticalFacing(currFacing) ? top : left;

  if (isGridAligned(travelPosition)) {
    return null;
  }

  return {
    nextFacing: currFacing,
    toValue: getNextAlley(travelPosition, currFacing) * totalWidth,
  };
}

export function getPixelsToMove(
  facing: Facing,
  nextPosition: number,
  currTop: number,
  currLeft: number,
) {
  switch (facing) {
    case 'N':
      return currTop - nextPosition;
    case 'S':
      return nextPosition - currTop;
    case 'E':
      return nextPosition - currLeft;
    case 'W':
      return currLeft - nextPosition;
  }
}

export function getIsPlayerInLineOfSight(
  facing: Facing,
  currTop: number,
  currLeft: number,
  playerTop: number,
  playerLeft: number,
) {
  switch (facing) {
    case 'N':
      return (
        playerTop < currTop && Math.abs(playerLeft - currLeft) < alleyWidth / 2
      );
    case 'S':
      return (
        currTop < playerTop && Math.abs(playerLeft - currLeft) < alleyWidth / 2
      );
    case 'E':
      return (
        currLeft < playerLeft && Math.abs(playerTop - currTop) < alleyWidth / 2
      );
    case 'W':
      return (
        playerLeft < currLeft && Math.abs(playerTop - currTop) < alleyWidth / 2
      );
  }
}

export function getShouldTrackToPlayerPosition({
  currFacing,
  currPosition,
  playerPosition,
}: {
  currFacing: Facing;
  currPosition: {top: number; left: number};
  playerPosition: {top: number; left: number};
}) {
  const position = isVerticalFacing(currFacing)
    ? currPosition.top
    : currPosition.left;
  const nextPosition = isVerticalFacing(currFacing)
    ? playerPosition.top
    : playerPosition.left;
  const isPlayerInFrontOfCraft =
    ((currFacing === 'E' || currFacing === 'S') && nextPosition > position) ||
    ((currFacing === 'W' || currFacing === 'N') && nextPosition < position);

  return (
    isPlayerInFrontOfCraft &&
    getNextAlley(position, currFacing) !==
      getNextAlley(nextPosition, currFacing)
  );
}
