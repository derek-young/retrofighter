import {useCallback, useEffect, useRef, useState} from 'react';
import {Animated} from 'react-native';

import {Facing} from 'Game/types';
import {animateCraft, isVerticalFacing} from 'Game/utils';
import {totalWidth} from 'Game/constants';
import {useGameContext} from 'Game/GameContext';
import {PLAYER_ID, Position} from 'Game/engine/Simulation';
import {useSimulationContext} from 'Game/engine/SimulationContext';
import {useHasPlayerMoved} from 'Game/Fighter/AnimationContext';
import {useEliminationContext} from 'Game/Fighter/EliminationContext';

import {
  controlledAnimation,
  randomAnimation,
  getPixelsToMove,
  getShouldTrackToPlayerPosition,
} from './animation';

type CraftAnimationProps = {
  craftSpeedWhenLockedOn?: number;
  defaultCraftSpeed: number;
  defaultFacing: Facing;
  freezeWhenPlayerDetected?: boolean;
  isEliminated: boolean;
  onIsEliminated: () => void;
  simId: string;
  startingTop: number;
  startingLeft: number;
};

function useEnemyCraftAnimation({
  defaultCraftSpeed,
  craftSpeedWhenLockedOn = defaultCraftSpeed,
  defaultFacing,
  freezeWhenPlayerDetected = false,
  isEliminated,
  onIsEliminated,
  simId,
  startingLeft,
  startingTop,
}: CraftAnimationProps) {
  const simulation = useSimulationContext();
  const {isPaused} = useGameContext();
  const hasPlayerMoved = useHasPlayerMoved();
  const {isPlayerEliminated} = useEliminationContext();

  const [facing, setFacing] = useState<Facing>(defaultFacing);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isPlayerInLineOfSight, setIsPlayerInLineOfSight] = useState(false);
  const [frozenPosition, setFrozenPosition] = useState<null | Position>(null);
  const facingRef = useRef(facing);
  const leftAnim = useRef(new Animated.Value(startingLeft)).current;
  const topAnim = useRef(new Animated.Value(startingTop)).current;
  const controlledFacingRef = useRef<null | Facing>(null);
  const detectedPlayerFacingRef = useRef<null | Facing>(null);
  const detectedPlayerPositionRef = useRef<null | Position>(null);
  const isEliminatedRef = useRef(false);
  const isFrozenRef = useRef(false);
  const isPlayerEliminatedRef = useRef(isPlayerEliminated);
  const isPlayerInLineOfSightRef = useRef(false);
  const isPlayerInLineOfSightPrevRef = useRef(false);
  const isPausedRef = useRef(isPaused);
  const isPausedPrevRef = useRef(isPaused);
  const craftSpeedRef = useRef<number>(defaultCraftSpeed);
  const onIsEliminatedRef = useRef(onIsEliminated);

  facingRef.current = facing;
  isEliminatedRef.current = isEliminated;
  isPlayerEliminatedRef.current = isPlayerEliminated;
  isPlayerInLineOfSightRef.current = isPlayerInLineOfSight;
  isPausedRef.current = isPaused;
  onIsEliminatedRef.current = onIsEliminated;

  useEffect(() => {
    simulation.addCraft(simId, {
      kind: 'enemy',
      top: startingTop,
      left: startingLeft,
      facing: defaultFacing,
      isCollidable: true,
      onEliminated: () => onIsEliminatedRef.current(),
      onLineOfSightChange: setIsPlayerInLineOfSight,
    });

    return () => simulation.removeCraft(simId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simId, simulation]);

  useEffect(() => {
    if (isEliminated) {
      simulation.setCollidable(simId, false);
    }
  }, [isEliminated, simId, simulation]);

  const animate = useCallback(
    (craftSpeed: number) => {
      craftSpeedRef.current = craftSpeed;

      if (isEliminatedRef.current || isFrozenRef.current) {
        return;
      }

      const position = simulation.getPosition(simId);
      const playerPosition = simulation.getPosition(PLAYER_ID);

      if (!position || !playerPosition) {
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
          currPosition: position,
          playerPosition: detectedPlayerPositionRef.current,
        });

      const detectedFacing =
        controlledFacingRef.current || detectedPlayerFacingRef.current;

      if (!isPlayerEliminatedRef.current && isPlayerInLineOfSightRef.current) {
        // Player spotted: chase them down their alley.
        nextAnimation = controlledAnimation({
          nextFacing: facingRef.current,
          playerLeft: playerPosition.left,
          playerTop: playerPosition.top,
        });
      } else if (
        detectedPlayerPositionRef.current &&
        shouldTrackToPlayerPosition
      ) {
        // Player left the line of sight: move to their last known position.
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
          left: position.left,
          top: position.top,
        });

        controlledFacingRef.current = null;
        detectedPlayerFacingRef.current = null;
        detectedPlayerPositionRef.current = null;
      }

      let {nextFacing, toValue} = nextAnimation;

      let pixelsToMove = getPixelsToMove(
        nextFacing,
        toValue,
        position.top,
        position.left,
      );

      if (pixelsToMove < 1) {
        ({nextFacing, toValue} = randomAnimation({
          left: position.left,
          top: position.top,
        }));
      }

      const axis = isVerticalFacing(nextFacing) ? 'top' : 'left';
      const animation = axis === 'top' ? topAnim : leftAnim;

      setFacing(nextFacing);
      simulation.setFacing(simId, nextFacing);
      simulation.setSegment(simId, {axis, to: toValue, speed: craftSpeed});

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
        from: axis === 'top' ? position.top : position.left,
        toValue,
      });
    },
    [
      craftSpeedWhenLockedOn,
      defaultCraftSpeed,
      leftAnim,
      simId,
      simulation,
      topAnim,
    ],
  );

  const freeze = useCallback(() => {
    const position = simulation.getPosition(simId);

    if (!position) {
      return;
    }

    isFrozenRef.current = true;
    simulation.stopCraft(simId);
    leftAnim.stopAnimation();
    topAnim.stopAnimation();
    leftAnim.setValue(position.left);
    topAnim.setValue(position.top);
    setFrozenPosition(position);
  }, [leftAnim, simId, simulation, topAnim]);

  useEffect(() => {
    if (hasPlayerMoved && !hasInitialized) {
      animate(defaultCraftSpeed);
      setHasInitialized(true);
    }
  }, [hasInitialized, hasPlayerMoved]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isPaused || isPlayerEliminated || isFrozenRef.current) {
      return;
    }

    if (isPlayerInLineOfSight) {
      if (freezeWhenPlayerDetected) {
        freeze();
        return;
      }

      leftAnim.stopAnimation();
      topAnim.stopAnimation();
      animate(craftSpeedWhenLockedOn);

      isPlayerInLineOfSightPrevRef.current = true;
    } else if (!isPlayerInLineOfSight && isPlayerInLineOfSightPrevRef.current) {
      detectedPlayerFacingRef.current =
        simulation.getFacing(PLAYER_ID) ?? null;
      detectedPlayerPositionRef.current =
        simulation.getPosition(PLAYER_ID) ?? null;
      leftAnim.stopAnimation();
      topAnim.stopAnimation();
      isPlayerInLineOfSightPrevRef.current = false;
      animate(craftSpeedWhenLockedOn);
    }
  }, [isPaused, isPlayerEliminated, isPlayerInLineOfSight]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isPaused) {
      leftAnim.stopAnimation();
      topAnim.stopAnimation();
      isPausedPrevRef.current = true;
    } else if (isPausedPrevRef.current) {
      if (hasInitialized && !isFrozenRef.current) {
        animate(craftSpeedRef.current);
      }
      isPausedPrevRef.current = false;
    }
  }, [animate, hasInitialized, isPaused, leftAnim, topAnim]);

  return {
    facing,
    frozenPosition,
    leftAnim,
    topAnim,
    isPlayerInLineOfSight,
  };
}

export default useEnemyCraftAnimation;
