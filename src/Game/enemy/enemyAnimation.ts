import {getNextAlley, isVerticalFacing} from 'Game/utils';
import {Facing} from 'Game/types';
import {
  alleyWidth,
  seperatorWidth,
  numColumns,
  maxTop,
  minTop,
  maxLeft,
  minLeft,
} from 'Game/gameConstants';

interface AnimationProps {
  nextFacing: Facing;
  pixelsToMove: number;
  toValue: number;
}

function getRandomNumber([start, end]: number[]) {
  const range = end - start;
  return end - Math.ceil(Math.random() * range);
}

function getValidFacings(top: number, left: number) {
  const directions: Facing[] = [];

  if (top !== minTop) {
    directions.push('N');
  }
  if (top !== maxTop) {
    directions.push('S');
  }
  if (left !== minLeft) {
    directions.push('W');
  }
  if (left !== maxLeft) {
    directions.push('E');
  }

  return directions;
}

function getNextFacing(top: number, left: number) {
  const validFacings = getValidFacings(top, left);
  const nextFacingIndex = getRandomNumber([0, validFacings.length]);

  return validFacings[nextFacingIndex];
}

function getRandomColumnPosition(facing: Facing, left: number) {
  const currentColumn = Math.round(left / (alleyWidth + seperatorWidth));
  const nextColumnRange =
    facing === 'E' ? [currentColumn + 1, numColumns] : [0, currentColumn];
  const nextColumn = getRandomNumber(nextColumnRange);

  return nextColumn * (alleyWidth + seperatorWidth);
}

function getRandomRowPosition(facing: Facing, top: number) {
  const currentRow = Math.round(top / (alleyWidth + seperatorWidth));
  const nextRowRange =
    facing === 'S' ? [currentRow + 1, numColumns] : [0, currentRow];
  const nextRow = getRandomNumber(nextRowRange);

  return nextRow * (alleyWidth + seperatorWidth);
}

function getRandomAlleyPosition(facing: Facing, top: number, left: number) {
  switch (facing) {
    case 'N':
    case 'S':
      return getRandomRowPosition(facing, top);
    case 'E':
    case 'W':
      return getRandomColumnPosition(facing, left);
  }
}

function getPositionOfPlayerCraft(
  facing: Facing,
  playerTop: number,
  playerLeft: number,
) {
  const playerPosition = isVerticalFacing(facing) ? playerTop : playerLeft;
  const isPlayerFlushToAlley =
    playerPosition % (alleyWidth + seperatorWidth) < 1;
  const nextAlley = getNextAlley(playerPosition, facing);

  return (
    (isPlayerFlushToAlley ? nextAlley : nextAlley - 1) *
    (alleyWidth + seperatorWidth)
  );
}

function getPixelsToMove(
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

export function controlledAnimation({
  facingOverride,
  currFacing,
  left,
  top,
  playerLeft,
  playerTop,
}: {
  facingOverride?: Facing | null;
  currFacing: Facing;
  left: number;
  top: number;
  playerLeft: number;
  playerTop: number;
}): AnimationProps {
  const nextFacing = facingOverride ? facingOverride : currFacing;
  const nextAlleyPosition = getPositionOfPlayerCraft(
    nextFacing,
    playerTop,
    playerLeft,
  );
  const pixelsToMove = getPixelsToMove(
    nextFacing,
    nextAlleyPosition,
    top,
    left,
  );

  return {
    nextFacing,
    pixelsToMove,
    toValue: nextAlleyPosition,
  };
}

export function randomAnimation({
  left,
  top,
}: {
  left: number;
  top: number;
}): AnimationProps {
  const nextFacing = getNextFacing(top, left);
  const nextAlleyPosition = getRandomAlleyPosition(nextFacing, top, left);
  const pixelsToMove = getPixelsToMove(
    nextFacing,
    nextAlleyPosition,
    top,
    left,
  );

  return {
    nextFacing,
    pixelsToMove,
    toValue: nextAlleyPosition,
  };
}
