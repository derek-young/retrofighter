import {getNextAlley, isVerticalFacing} from 'Game/utils';
import {Facing} from 'Game/types';
import {alleyWidth} from 'Game/constants';

export interface AnimationProps {
  nextFacing: Facing;
  toValue: number;
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
