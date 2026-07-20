import {useCallback, useEffect, useRef, useState} from 'react';
import {Animated} from 'react-native';

import {Facing} from 'Game/types';
import {animateCraft, getNextAlley, isVerticalFacing} from 'Game/utils';
import {itemDetectionRange, totalWidth} from 'Game/constants';
import {useGameContext} from 'Game/GameContext';
import {PLAYER_ID, Position} from 'Game/engine/Simulation';
import {useSimulationContext} from 'Game/engine/SimulationContext';
import {useHasPlayerMoved} from 'Game/Fighter/AnimationContext';
import {useEliminationContext} from 'Game/Fighter/EliminationContext';

import {
  controlledAnimation,
  dodgeAnimation,
  randomAnimation,
  getPixelsToMove,
  getShouldTrackToPlayerPosition,
  getSnapToGridLeg,
} from './animation';
import type {AnimationProps} from './animation';

export type AiClass = 'veteran' | 'commander';

function getNearbyItem(
  items: Array<{id: string; position: Position}>,
  position: Position,
) {
  let nearest: {
    item: {id: string; position: Position};
    distance: number;
  } | null = null;

  for (const item of items) {
    const distance =
      Math.abs(item.position.top - position.top) +
      Math.abs(item.position.left - position.left);

    if (nearest === null || distance < nearest.distance) {
      nearest = {item, distance};
    }
  }

  return nearest !== null && nearest.distance <= itemDetectionRange
    ? nearest.item
    : null;
}

type CraftAnimationProps = {
  aiClasses?: AiClass[];
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
  aiClasses = [],
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
  const dodgeRef = useRef<(threatFacing: Facing) => void>(() => {});
  const commanderAlertRef = useRef<(playerPosition: Position) => void>(
    () => {},
  );
  const isDodgingRef = useRef(false);
  const isEliminatedRef = useRef(false);
  const isFrozenRef = useRef(false);
  const freezeTravelRef = useRef<null | (() => void)>(null);
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
      onThreatened: aiClasses.includes('veteran')
        ? ({facing: threatFacing}) => dodgeRef.current(threatFacing)
        : undefined,
      isCommander: aiClasses.includes('commander'),
      onCommanderAlert: playerPosition =>
        commanderAlertRef.current(playerPosition),
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

      if (
        isEliminatedRef.current ||
        isFrozenRef.current ||
        isDodgingRef.current
      ) {
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

      // Branches that consume the detection refs defer clearing them until
      // the planned move actually starts: a snap-to-grid leg may run first,
      // and the re-plan after it needs the refs intact to make the same
      // decision from the aligned position.
      let commitPlan = () => {};

      const shouldTrackToPlayerPosition =
        detectedPlayerPositionRef.current &&
        getShouldTrackToPlayerPosition({
          currFacing: facingRef.current,
          currPosition: position,
          playerPosition: detectedPlayerPositionRef.current,
        });

      const detectedFacing =
        controlledFacingRef.current || detectedPlayerFacingRef.current;

      const nearbyItem = getNearbyItem(simulation.getItems(), position);

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

        commitPlan = () => {
          controlledFacingRef.current = null;
          detectedPlayerPositionRef.current = null;
        };
      } else if (nearbyItem) {
        // Race to a nearby uncollected item: align on its column first,
        // then travel to its row. Each leg re-plans, so a taken item just
        // falls through to wandering.
        const columnGap = nearbyItem.position.left - position.left;

        nextAnimation =
          Math.abs(columnGap) >= 1
            ? {
                nextFacing: columnGap > 0 ? 'E' : 'W',
                toValue: nearbyItem.position.left,
              }
            : {
                nextFacing: nearbyItem.position.top > position.top ? 'S' : 'N',
                toValue: nearbyItem.position.top,
              };
      } else if (detectedFacing) {
        nextAnimation = randomAnimation({
          detectedFacing,
          left: position.left,
          top: position.top,
        });

        commitPlan = () => {
          controlledFacingRef.current = null;
          detectedPlayerFacingRef.current = null;
          detectedPlayerPositionRef.current = null;
        };
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

      // A mid-segment re-plan (lock-on, lock lost, commander alert) can stop
      // the craft between alleys; turning from there would leave it riding
      // off the grid, so finish travelling to the intersection first.
      const snapLeg = getSnapToGridLeg({
        currFacing: facingRef.current,
        nextFacing,
        top: position.top,
        left: position.left,
      });

      if (snapLeg) {
        ({nextFacing, toValue} = snapLeg);
      } else {
        commitPlan();
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

  const runDodgeLegs = useCallback(
    (legs: AnimationProps[]) => {
      const [leg, ...remainingLegs] = legs;

      if (!leg) {
        isDodgingRef.current = false;
        animate(
          isPlayerInLineOfSightRef.current
            ? craftSpeedWhenLockedOn
            : defaultCraftSpeed,
        );
        return;
      }

      const position = simulation.getPosition(simId);

      if (!position) {
        isDodgingRef.current = false;
        return;
      }

      const axis = isVerticalFacing(leg.nextFacing) ? 'top' : 'left';
      const animation = axis === 'top' ? topAnim : leftAnim;

      setFacing(leg.nextFacing);
      simulation.setFacing(simId, leg.nextFacing);
      simulation.setSegment(simId, {
        axis,
        to: leg.toValue,
        speed: craftSpeedWhenLockedOn,
      });

      animateCraft({
        animation,
        callback: ({finished}) => {
          if (isPausedRef.current) {
            // Abandon the dodge; the resume effect restarts normal movement.
            isDodgingRef.current = false;
            controlledFacingRef.current = facingRef.current;
          } else if (finished) {
            runDodgeLegs(remainingLegs);
          } else {
            isDodgingRef.current = false;
          }
        },
        craftSpeed: craftSpeedWhenLockedOn,
        from: axis === 'top' ? position.top : position.left,
        toValue: leg.toValue,
      });
    },
    [
      animate,
      craftSpeedWhenLockedOn,
      defaultCraftSpeed,
      leftAnim,
      simId,
      simulation,
      topAnim,
    ],
  );

  const dodge = useCallback(
    (threatFacing: Facing) => {
      if (
        isDodgingRef.current ||
        isEliminatedRef.current ||
        isFrozenRef.current ||
        isPausedRef.current
      ) {
        return;
      }

      const position = simulation.getPosition(simId);

      if (!position) {
        return;
      }

      const legs = dodgeAnimation({
        threatFacing,
        currentFacing: facingRef.current,
        top: position.top,
        left: position.left,
      });

      if (legs.length === 0) {
        return;
      }

      isDodgingRef.current = true;
      leftAnim.stopAnimation();
      topAnim.stopAnimation();
      runDodgeLegs(legs);
    },
    [leftAnim, runDodgeLegs, simId, simulation, topAnim],
  );

  dodgeRef.current = dodge;

  const freeze = useCallback(() => {
    const position = simulation.getPosition(simId);

    if (!position) {
      return;
    }

    isFrozenRef.current = true;
    // Once a cargo ship commits to deploying, it can no longer be shot down.
    // A hit here would eliminate it before its speeders are registered, and
    // the board would read as clear — ending the level as the speeders spawn.
    simulation.setCollidable(simId, false);

    const facing = facingRef.current;
    const axis = isVerticalFacing(facing) ? 'top' : 'left';
    const animation = axis === 'top' ? topAnim : leftAnim;

    // Deploy from the next grid intersection *ahead* in the direction of
    // travel. The cross axis already rides an alley; the travel axis is
    // wherever detection happened, so the ship keeps going to the
    // intersection in front of it — snapping to the nearest one would jump it
    // backwards, and either way the speeders must spawn aligned to the grid.
    const target =
      getNextAlley(axis === 'top' ? position.top : position.left, facing) *
      totalWidth;

    const snappedPosition = {
      top:
        axis === 'top'
          ? target
          : Math.round(position.top / totalWidth) * totalWidth,
      left:
        axis === 'left'
          ? target
          : Math.round(position.left / totalWidth) * totalWidth,
    };

    // Fly the final leg to the release point, then drop the speeders. Stored
    // so a pause mid-leg can restart it from the paused position on resume —
    // a frozen ship is otherwise skipped by the resume path and would strand
    // itself, never spawning its speeders.
    const travelToReleasePoint = () => {
      const current = simulation.getPosition(simId);

      if (!current) {
        return;
      }

      simulation.setSegment(simId, {
        axis,
        to: target,
        speed: craftSpeedRef.current,
      });

      animateCraft({
        animation,
        callback: ({finished}) => {
          if (!finished) {
            return;
          }

          freezeTravelRef.current = null;
          simulation.setPosition(simId, snappedPosition);
          leftAnim.setValue(snappedPosition.left);
          topAnim.setValue(snappedPosition.top);
          setFrozenPosition(snappedPosition);
        },
        craftSpeed: craftSpeedRef.current,
        from: axis === 'top' ? current.top : current.left,
        toValue: target,
      });
    };

    freezeTravelRef.current = travelToReleasePoint;
    leftAnim.stopAnimation();
    topAnim.stopAnimation();
    travelToReleasePoint();
  }, [leftAnim, simId, simulation, topAnim]);

  // A commander that spots the player alerts the whole board. Each other enemy
  // reacts here: cargo ships release their speeders (the same freeze path as
  // seeing the player), and everyone else takes one move toward the player's
  // reported position by reusing the last-known-position tracking.
  const handleCommanderAlert = useCallback(
    (playerPosition: Position) => {
      if (
        isEliminatedRef.current ||
        isFrozenRef.current ||
        isDodgingRef.current ||
        isPausedRef.current ||
        isPlayerEliminatedRef.current ||
        isPlayerInLineOfSightRef.current
      ) {
        return;
      }

      if (freezeWhenPlayerDetected) {
        freeze();
        return;
      }

      const position = simulation.getPosition(simId);

      if (!position) {
        return;
      }

      // Face the reported position, not the player's own facing: that facing
      // drives the escape-pursuit guess ("follow where they went"), which only
      // makes sense for a craft that was already chasing. An alerted craft may
      // face anywhere, so pick the axis with the wider gap to the player —
      // otherwise the tracking gate in `animate` cancels and the move
      // degenerates to a random wander.
      const columnGap = playerPosition.left - position.left;
      const rowGap = playerPosition.top - position.top;

      detectedPlayerFacingRef.current =
        Math.abs(columnGap) >= Math.abs(rowGap)
          ? columnGap > 0
            ? 'E'
            : 'W'
          : rowGap > 0
          ? 'S'
          : 'N';
      detectedPlayerPositionRef.current = playerPosition;
      leftAnim.stopAnimation();
      topAnim.stopAnimation();
      animate(craftSpeedWhenLockedOn);
    },
    [
      animate,
      craftSpeedWhenLockedOn,
      freeze,
      freezeWhenPlayerDetected,
      leftAnim,
      simId,
      simulation,
      topAnim,
    ],
  );

  commanderAlertRef.current = handleCommanderAlert;

  useEffect(() => {
    if (hasPlayerMoved && !hasInitialized) {
      animate(defaultCraftSpeed);
      setHasInitialized(true);
    }
  }, [hasInitialized, hasPlayerMoved]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (
      isPaused ||
      isPlayerEliminated ||
      isFrozenRef.current ||
      isDodgingRef.current
    ) {
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
      detectedPlayerFacingRef.current = simulation.getFacing(PLAYER_ID) ?? null;
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
      if (isFrozenRef.current) {
        // Resume the interrupted last leg to the release point (a no-op once
        // the ship has already arrived and is deploying).
        freezeTravelRef.current?.();
      } else if (hasInitialized) {
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
