import {useCallback, useEffect, useRef, useState} from 'react';
import {Animated} from 'react-native';

import {animateCraft} from 'Game/utils';
import {Facing} from 'Game/types';

import {useEnemyContext} from './EnemyContext';

import {
  alleyWidth,
  seperatorWidth,
  numColumns,
  maxTop,
  minTop,
  maxLeft,
  minLeft,
} from 'Game/gameConstants';

type CraftAnimationProps = {
  defaultFacing: Facing;
  startingTop: number;
  startingLeft: number;
};

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

export function getNextAlley(position: number, direction: Facing) {
  const nextAlley = position / (alleyWidth + seperatorWidth);

  if (direction === 'N' || direction === 'W') {
    return Math.floor(nextAlley);
  }

  return Math.ceil(nextAlley);
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

function useEnemyCraftAnimation({
  defaultFacing,
  startingLeft,
  startingTop,
}: CraftAnimationProps) {
  const {playerLeft, playerTop} = useEnemyContext();
  const [facing, setFacing] = useState<Facing>(defaultFacing);
  const leftAnim = useRef(new Animated.Value(startingLeft)).current;
  const topAnim = useRef(new Animated.Value(startingTop)).current;
  const leftRef = useRef(startingLeft);
  const topRef = useRef(startingTop);

  useEffect(() => {
    leftAnim.addListener(({value}) => (leftRef.current = value));
    topAnim.addListener(({value}) => (topRef.current = value));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const animate = () => {
    // TODO: If player is in line of sight, go to player
    const validFacings = getValidFacings(topRef.current, leftRef.current);
    const nextFacingIndex = getRandomNumber([0, validFacings.length]);
    const nextFacing = validFacings[nextFacingIndex];

    setFacing(nextFacing);

    const nextAlleyPosition = getRandomAlleyPosition(
      nextFacing,
      topRef.current,
      leftRef.current,
    );
    const pixelsToMove = getPixelsToMove(
      nextFacing,
      nextAlleyPosition,
      topRef.current,
      leftRef.current,
    );
    const animation =
      nextFacing === 'N' || nextFacing === 'S' ? topAnim : leftAnim;

    animateCraft({
      callback: animate,
      animation,
      pixelsToMove: pixelsToMove,
      toValue: nextAlleyPosition,
    });
  };

  const initialize = useCallback(animate, [topAnim, leftAnim]);

  return {
    facing,
    leftAnim,
    topAnim,
    initialize,
  };
}

export default useEnemyCraftAnimation;
