import {useCallback, useEffect, useRef, useState} from 'react';
import {Animated} from 'react-native';

import {animateCraft, getNextAlley, isVerticalFacing} from 'Game/utils';
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

function getIsPlayerInLineOfSight(
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

function useEnemyCraftAnimation({
  defaultFacing,
  startingLeft,
  startingTop,
}: CraftAnimationProps) {
  const {hasPlayerMoved, playerFacing, playerLeft, playerTop} =
    useEnemyContext();
  const [facing, setFacing] = useState<Facing>(defaultFacing);
  const facingRef = useRef(facing);
  const leftAnim = useRef(new Animated.Value(startingLeft)).current;
  const topAnim = useRef(new Animated.Value(startingTop)).current;
  const leftRef = useRef(startingLeft);
  const topRef = useRef(startingTop);
  const playerLeftRef = useRef(playerLeft);
  const playerTopRef = useRef(playerTop);
  const detectedPlayerFacingRef = useRef<null | Facing>(null);
  const isPlayerInLineOfSightRef = useRef(false);
  const isPlayerInLineOfSightOverrideRef = useRef(false);

  const isPlayerInLineOfSight = getIsPlayerInLineOfSight(
    facing,
    topRef.current,
    leftRef.current,
    playerTop,
    playerLeft,
  );

  facingRef.current = facing;
  playerLeftRef.current = playerLeft;
  playerTopRef.current = playerTop;
  isPlayerInLineOfSightRef.current = isPlayerInLineOfSight;

  useEffect(() => {
    leftAnim.addListener(({value}) => (leftRef.current = value));
    topAnim.addListener(({value}) => (topRef.current = value));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (hasPlayerMoved && isPlayerInLineOfSight) {
      isPlayerInLineOfSightOverrideRef.current = true;
      topAnim.stopAnimation();
    }
  }, [isPlayerInLineOfSight]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isPlayerInLineOfSightRef.current) {
      detectedPlayerFacingRef.current = playerFacing;
    }
  }, [playerFacing]);

  const animate = (
    facingOverride?: Facing | null,
    isPlayerInLineOfSightOverride?: boolean,
  ) => {
    const isInLightOfSight =
      isPlayerInLineOfSightOverride || isPlayerInLineOfSightRef.current;
    const nextFacing = facingOverride
      ? facingOverride
      : isInLightOfSight
      ? facingRef.current
      : getNextFacing(topRef.current, leftRef.current);

    const nextAlleyPosition = isInLightOfSight
      ? getPositionOfPlayerCraft(
          nextFacing,
          playerTopRef.current,
          playerLeftRef.current,
        )
      : getRandomAlleyPosition(nextFacing, topRef.current, leftRef.current);

    const pixelsToMove = getPixelsToMove(
      nextFacing,
      nextAlleyPosition,
      topRef.current,
      leftRef.current,
    );

    const animation = isVerticalFacing(nextFacing) ? topAnim : leftAnim;

    if (pixelsToMove < 1) {
      return;
    }

    setFacing(nextFacing);

    animateCraft({
      callback: () => {
        animate(
          detectedPlayerFacingRef.current,
          isPlayerInLineOfSightOverrideRef.current,
        );
        detectedPlayerFacingRef.current = null;
        isPlayerInLineOfSightOverrideRef.current = false;
      },
      animation,
      pixelsToMove,
      toValue: nextAlleyPosition,
    });
  };

  const initialize = useCallback(animate, [topAnim, leftAnim]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    facing,
    leftAnim,
    topAnim,
    initialize,
  };
}

export default useEnemyCraftAnimation;
