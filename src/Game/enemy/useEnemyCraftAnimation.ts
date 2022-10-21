import {useCallback, useEffect, useRef, useState} from 'react';
import {Animated} from 'react-native';

import {Facing} from 'Game/types';
import {animateCraft, isVerticalFacing} from 'Game/utils';
import {useAnimationContext} from 'Game/Fighter/AnimationContext';

import {
  controlledAnimation,
  randomAnimation,
  getPixelsToMove,
  getIsPlayerInLineOfSight,
  getShouldTrackToPlayerPosition,
} from './animation';
import usePlayerTracking from './usePlayerTracking';

type CraftAnimationProps = {
  defaultFacing: Facing;
  startingTop: number;
  startingLeft: number;
};

function useEnemyCraftAnimation({
  defaultFacing,
  startingLeft,
  startingTop,
}: CraftAnimationProps) {
  const {facing: playerFacing, hasPlayerMoved} = useAnimationContext();
  const {playerLeft, playerTop} = usePlayerTracking();

  const [facing, setFacing] = useState<Facing>(defaultFacing);
  const facingRef = useRef(facing);
  const leftAnim = useRef(new Animated.Value(startingLeft)).current;
  const topAnim = useRef(new Animated.Value(startingTop)).current;
  const leftRef = useRef(startingLeft);
  const topRef = useRef(startingTop);
  const playerLeftRef = useRef(playerLeft);
  const playerTopRef = useRef(playerTop);
  const playerFacingRef = useRef(playerFacing);
  const detectedPlayerFacingRef = useRef<null | Facing>(null);
  const detectedPlayerPositionRef = useRef<null | {top: number; left: number}>(
    null,
  );
  const isPlayerInLineOfSightRef = useRef(false);

  const isPlayerInLineOfSight = getIsPlayerInLineOfSight(
    facing,
    topRef.current,
    leftRef.current,
    playerTopRef.current,
    playerLeftRef.current,
  );

  facingRef.current = facing;
  isPlayerInLineOfSightRef.current = isPlayerInLineOfSight;

  useEffect(() => {
    leftAnim.addListener(({value}) => (leftRef.current = value));
    topAnim.addListener(({value}) => (topRef.current = value));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!hasPlayerMoved) {
      return;
    }

    if (isPlayerInLineOfSight) {
      topAnim.stopAnimation();
    } else {
      detectedPlayerFacingRef.current = playerFacingRef.current;
      detectedPlayerPositionRef.current = {
        left: playerLeftRef.current,
        top: playerTopRef.current,
      };
      topAnim.stopAnimation();
    }
  }, [isPlayerInLineOfSight]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update values after useEffect to preserve previous value
  playerLeftRef.current = playerLeft;
  playerTopRef.current = playerTop;
  playerFacingRef.current = playerFacing;

  const animate = () => {
    let nextAnimation = {
      nextFacing: facingRef.current,
      toValue: 0,
    };

    const shouldTrackToPlayerPosition =
      detectedPlayerPositionRef.current &&
      getShouldTrackToPlayerPosition({
        currFacing: facingRef.current,
        currPosition: {top: topRef.current, left: leftRef.current},
        playerPosition: detectedPlayerPositionRef.current,
      });

    if (isPlayerInLineOfSightRef.current) {
      console.log('player is in line of sight, getting controlled amin');
      nextAnimation = controlledAnimation({
        nextFacing: facingRef.current,
        playerLeft: playerLeftRef.current,
        playerTop: playerTopRef.current,
      });
    } else if (
      detectedPlayerPositionRef.current &&
      shouldTrackToPlayerPosition
    ) {
      console.log('player left line of sight, moving to last position');

      const nextPosition = isVerticalFacing(facingRef.current)
        ? detectedPlayerPositionRef.current.top
        : detectedPlayerPositionRef.current.left;

      nextAnimation = {
        nextFacing: facingRef.current,
        toValue: nextPosition,
      };

      console.table({
        name: 'Direct',
        ...nextAnimation,
      });

      detectedPlayerPositionRef.current = null;
    } else if (detectedPlayerFacingRef.current) {
      console.log('moving to last player detected facing');
      nextAnimation = randomAnimation({
        detectedFacing: detectedPlayerFacingRef.current,
        left: leftRef.current,
        top: topRef.current,
      });

      detectedPlayerFacingRef.current = null;
      detectedPlayerPositionRef.current = null;
    } else {
      nextAnimation = randomAnimation({
        left: leftRef.current,
        top: topRef.current,
      });
    }

    const {nextFacing, toValue} = nextAnimation;

    const pixelsToMove = getPixelsToMove(
      nextFacing,
      toValue,
      topRef.current,
      leftRef.current,
    );

    const animation = isVerticalFacing(nextFacing) ? topAnim : leftAnim;

    if (pixelsToMove < 1) {
      return;
    }

    setFacing(nextFacing);

    animateCraft({
      callback: animate,
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
