import {useCallback, useEffect, useRef, useState} from 'react';
import {Animated} from 'react-native';

import {Facing} from 'Game/types';
import {animateCraft, isVerticalFacing} from 'Game/utils';
import {playerStartLeft, playerStartTop, totalWidth} from 'Game/constants';
import {useGameContext} from 'Game/GameContext';
import {useAnimationContext} from 'Game/Fighter/AnimationContext';
import {useEliminationContext} from 'Game/Fighter/EliminationContext';

import {
  controlledAnimation,
  randomAnimation,
  getPixelsToMove,
  getIsPlayerInLineOfSight,
  getShouldTrackToPlayerPosition,
} from './animation';

type CraftAnimationProps = {
  craftSpeedWhenLockedOn?: number;
  defaultCraftSpeed: number;
  defaultFacing: Facing;
  isEliminated: boolean;
  startingTop: number;
  startingLeft: number;
};

function useEnemyCraftAnimation({
  defaultCraftSpeed,
  craftSpeedWhenLockedOn = defaultCraftSpeed,
  defaultFacing,
  isEliminated,
  startingLeft,
  startingTop,
}: CraftAnimationProps) {
  const {isPaused} = useGameContext();
  const {
    facing: playerFacing,
    hasPlayerMoved,
    leftAnim: playerLeftAnim,
    topAnim: playerTopAnim,
  } = useAnimationContext();
  const {isPlayerEliminated} = useEliminationContext();

  const [facing, setFacing] = useState<Facing>(defaultFacing);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isPlayerInLineOfSight, setIsPlayerInLineOfSight] = useState(false);
  const facingRef = useRef(facing);
  const leftAnimRef = useRef(new Animated.Value(startingLeft));
  const topAnimRef = useRef(new Animated.Value(startingTop));
  const leftRef = useRef(startingLeft);
  const topRef = useRef(startingTop);
  const playerLeftRef = useRef(playerStartLeft);
  const playerTopRef = useRef(playerStartTop);
  const playerFacingRef = useRef(playerFacing);
  const controlledFacingRef = useRef<null | Facing>(null);
  const detectedPlayerFacingRef = useRef<null | Facing>(null);
  const detectedPlayerPositionRef = useRef<null | {top: number; left: number}>(
    null,
  );
  const hasPlayerMovedRef = useRef(hasPlayerMoved);
  const isEliminatedRef = useRef(false);
  const isPlayerEliminatedRef = useRef(isPlayerEliminated);
  const isPlayerInLineOfSightRef = useRef(false);
  const isPlayerInLineOfSightPrevRef = useRef(false);
  const isPausedRef = useRef(isPaused);
  const isPausedPrevRef = useRef(isPaused);
  const craftSpeedRef = useRef<number>(defaultCraftSpeed);

  facingRef.current = facing;
  hasPlayerMovedRef.current = hasPlayerMoved;
  isEliminatedRef.current = isEliminated;
  isPlayerEliminatedRef.current = isPlayerEliminated;
  isPlayerInLineOfSightRef.current = isPlayerInLineOfSight;
  isPausedRef.current = isPaused;
  playerFacingRef.current = playerFacing;

  const checkIsInLineOfSight = useCallback(() => {
    const nextIsPlayerInLineOfSight =
      !isPlayerEliminatedRef.current &&
      hasPlayerMovedRef.current &&
      getIsPlayerInLineOfSight(
        facingRef.current,
        topRef.current,
        leftRef.current,
        playerTopRef.current,
        playerLeftRef.current,
      );

    if (nextIsPlayerInLineOfSight !== isPlayerInLineOfSightRef.current) {
      setIsPlayerInLineOfSight(nextIsPlayerInLineOfSight);
    }
  }, []);

  useEffect(() => {
    leftAnimRef.current.addListener(({value}) => {
      leftRef.current = value;
      checkIsInLineOfSight();
    });
    topAnimRef.current.addListener(({value}) => {
      topRef.current = value;
      checkIsInLineOfSight();
    });
    playerLeftAnim.addListener(({value}) => (playerLeftRef.current = value));
    playerTopAnim.addListener(({value}) => (playerTopRef.current = value));

    () => {
      leftAnimRef.current.removeAllListeners();
      topAnimRef.current.removeAllListeners();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (hasPlayerMoved && !hasInitialized) {
      animate(defaultCraftSpeed);
      setHasInitialized(true);
    }
  }, [hasInitialized, hasPlayerMoved]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isPaused || isPlayerEliminated) {
      return;
    }

    if (isPlayerInLineOfSight) {
      leftAnimRef.current.stopAnimation();
      topAnimRef.current.stopAnimation();
      animate(craftSpeedWhenLockedOn);

      isPlayerInLineOfSightPrevRef.current = true;
    } else if (!isPlayerInLineOfSight && isPlayerInLineOfSightPrevRef.current) {
      detectedPlayerFacingRef.current = playerFacingRef.current;
      detectedPlayerPositionRef.current = {
        left: playerLeftRef.current,
        top: playerTopRef.current,
      };
      leftAnimRef.current.stopAnimation();
      topAnimRef.current.stopAnimation();
      isPlayerInLineOfSightPrevRef.current = false;
      animate(craftSpeedWhenLockedOn);
    }
  }, [isPaused, isPlayerEliminated, isPlayerInLineOfSight]); // eslint-disable-line react-hooks/exhaustive-deps

  const animate = useCallback(
    (craftSpeed: number) => {
      craftSpeedRef.current = craftSpeed;

      if (isEliminatedRef.current) {
        return;
      }

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

      const detectedFacing =
        controlledFacingRef.current || detectedPlayerFacingRef.current;

      if (!isPlayerEliminatedRef.current && isPlayerInLineOfSightRef.current) {
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
          toValue: Math.round(nextPosition - (nextPosition % totalWidth)),
        };

        controlledFacingRef.current = null;
        detectedPlayerPositionRef.current = null;
      } else if (detectedFacing) {
        nextAnimation = randomAnimation({
          detectedFacing,
          left: leftRef.current,
          top: topRef.current,
        });

        controlledFacingRef.current = null;
        detectedPlayerFacingRef.current = null;
        detectedPlayerPositionRef.current = null;
      }

      let {nextFacing, toValue} = nextAnimation;

      let pixelsToMove = getPixelsToMove(
        nextFacing,
        toValue,
        topRef.current,
        leftRef.current,
      );

      if (pixelsToMove < 1) {
        ({nextFacing, toValue} = randomAnimation({
          left: leftRef.current,
          top: topRef.current,
        }));

        pixelsToMove = getPixelsToMove(
          nextFacing,
          toValue,
          topRef.current,
          leftRef.current,
        );
      }

      const animation = isVerticalFacing(nextFacing)
        ? topAnimRef.current
        : leftAnimRef.current;

      setFacing(nextFacing);

      animateCraft({
        animation,
        callback: ({finished}) => {
          if (isPausedRef.current) {
            controlledFacingRef.current = facingRef.current;
          } else if (finished) {
            animate(
              isPlayerInLineOfSightRef.current
                ? craftSpeedWhenLockedOn
                : defaultCraftSpeed,
            );
          }
        },
        craftSpeed,
        pixelsToMove,
        toValue,
      });
    },
    [craftSpeedWhenLockedOn, defaultCraftSpeed],
  );

  useEffect(() => {
    if (isPaused) {
      leftAnimRef.current.stopAnimation();
      topAnimRef.current.stopAnimation();
      isPausedPrevRef.current = true;
    } else if (isPausedPrevRef.current) {
      if (hasInitialized) {
        animate(craftSpeedRef.current);
      }
      isPausedPrevRef.current = false;
    }
  }, [animate, hasInitialized, isPaused]);

  return {
    facing,
    leftAnim: leftAnimRef.current,
    topAnim: topAnimRef.current,
    isPlayerInLineOfSight,
  };
}

export default useEnemyCraftAnimation;
