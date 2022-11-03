import {Facing} from 'Game/types';
import {
  numColumns,
  maxTop,
  minTop,
  maxLeft,
  minLeft,
  totalWidth,
} from 'Game/constants';

import {AnimationProps} from './enemyAnimation';

function getRandomNumber([start, end]: number[]) {
  const range = end - start;
  return end - Math.ceil(Math.random() * range);
}

function getValidFacings(top: number, left: number) {
  const directions: Facing[] = [];

  if (top !== minTop) {
    directions.push('N');
  }
  if (top < maxTop - totalWidth) {
    directions.push('S');
  }
  if (left !== minLeft) {
    directions.push('W');
  }
  if (left < maxLeft - totalWidth) {
    directions.push('E');
  }

  return directions;
}

function getRandomFacing(top: number, left: number) {
  const validFacings = getValidFacings(top, left);
  const nextFacingIndex = getRandomNumber([0, validFacings.length]);

  return validFacings[nextFacingIndex];
}

function getRandomColumnPosition(facing: Facing, left: number) {
  const currentColumn = Math.round(left / totalWidth);
  const nextColumnRange =
    facing === 'E' ? [currentColumn + 1, numColumns] : [0, currentColumn];
  const nextColumn = getRandomNumber(nextColumnRange);

  return nextColumn * totalWidth;
}

function getRandomRowPosition(facing: Facing, top: number) {
  const currentRow = Math.round(top / totalWidth);
  const nextRowRange =
    facing === 'S' ? [currentRow + 1, numColumns] : [0, currentRow];
  const nextRow = getRandomNumber(nextRowRange);

  return nextRow * totalWidth;
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

function randomAnimation({
  detectedFacing,
  left,
  top,
}: {
  detectedFacing?: Facing;
  left: number;
  top: number;
}): AnimationProps {
  const nextFacing =
    detectedFacing && getValidFacings(top, left).includes(detectedFacing)
      ? detectedFacing
      : getRandomFacing(top, left);

  const nextAlleyPosition = getRandomAlleyPosition(nextFacing, top, left);

  return {
    nextFacing,
    toValue: nextAlleyPosition,
  };
}

export default randomAnimation;
