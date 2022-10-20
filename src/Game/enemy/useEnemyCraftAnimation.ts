import {useCallback, useEffect, useRef, useState} from 'react';
import {Animated} from 'react-native';

import {animateCraft, isVerticalFacing} from 'Game/utils';
import {Facing} from 'Game/types';

import {alleyWidth} from 'Game/gameConstants';

import {useEnemyContext} from './EnemyContext';
import {controlledAnimation, randomAnimation} from './animation';

type CraftAnimationProps = {
  defaultFacing: Facing;
  startingTop: number;
  startingLeft: number;
};

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
    facingOverride?: Facing | null | undefined,
    isPlayerInLineOfSightOverride?: boolean,
  ) => {
    let nextAnimation = {
      nextFacing: facingRef.current,
      pixelsToMove: 0,
      toValue: 0,
    };
    const wasPlayerSighted =
      isPlayerInLineOfSightOverride || isPlayerInLineOfSightRef.current;

    if (wasPlayerSighted) {
      nextAnimation = controlledAnimation({
        facingOverride,
        currFacing: facingRef.current,
        left: leftRef.current,
        top: topRef.current,
        playerTop: playerTopRef.current,
        playerLeft: playerLeftRef.current,
      });
    } else {
      nextAnimation = randomAnimation({
        left: leftRef.current,
        top: topRef.current,
      });
    }

    const {nextFacing, pixelsToMove, toValue} = nextAnimation;

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
      toValue,
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
