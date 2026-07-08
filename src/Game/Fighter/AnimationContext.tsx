import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {Animated} from 'react-native';

import {useGameContext} from 'Game/GameContext';
import {Axis, PLAYER_ID} from 'Game/engine/Simulation';
import {useSimulationContext} from 'Game/engine/SimulationContext';

import {
  craftPixelsPerSecond,
  defaultPlayerFacing,
  maxLeft,
  minLeft,
  maxTop,
  minTop,
  playerStartLeft,
  playerStartTop,
  totalWidth,
} from '../constants';
import {Facing} from '../types';
import {animateCraft, getNextAlley, isHorizontalFacing} from '../utils';

type PlayerControlsContextValue = {
  leftAnim: Animated.Value;
  topAnim: Animated.Value;
  onDownPress: () => void;
  onUpPress: () => void;
  onLeftPress: () => void;
  onRightPress: () => void;
  resetAnimationContext: () => void;
  setHasPlayerMoved: (hasPlayerMoved: boolean) => void;
  setThrusterEngagedFacing: (facing: null | Facing) => void;
};

const noop = () => {};

const defaultControls: PlayerControlsContextValue = {
  leftAnim: new Animated.Value(playerStartLeft),
  topAnim: new Animated.Value(playerStartTop),
  onDownPress: noop,
  onUpPress: noop,
  onLeftPress: noop,
  onRightPress: noop,
  resetAnimationContext: noop,
  setHasPlayerMoved: noop,
  setThrusterEngagedFacing: noop,
};

const PlayerControlsContext = React.createContext(defaultControls);
const PlayerFacingContext = React.createContext<Facing>(defaultPlayerFacing);
const HasPlayerMovedContext = React.createContext(false);

export const useAnimationContext = () => useContext(PlayerControlsContext);
export const usePlayerFacing = () => useContext(PlayerFacingContext);
export const useHasPlayerMoved = () => useContext(HasPlayerMovedContext);

function getPlayerSpeed(thrustersEngaged: boolean) {
  return thrustersEngaged ? craftPixelsPerSecond * 1.5 : craftPixelsPerSecond;
}

export const AnimationProvider = ({children}: {children: React.ReactNode}) => {
  const {isPaused} = useGameContext();
  const simulation = useSimulationContext();
  const [thrustersEngagedFacing, setThrusterEngagedFacing] =
    useState<null | Facing>(null);
  const [hasPlayerMoved, setHasPlayerMoved] = useState(false);
  const [facing, setFacing] = useState<Facing>(defaultPlayerFacing);
  const facingRef = useRef(facing);
  const leftAnim = useRef(new Animated.Value(playerStartLeft)).current;
  const topAnim = useRef(new Animated.Value(playerStartTop)).current;
  const thrustersEngagedRef = useRef(false);

  facingRef.current = facing;
  thrustersEngagedRef.current = thrustersEngagedFacing !== null;

  useEffect(() => {
    simulation.setCollidable(PLAYER_ID, hasPlayerMoved);
  }, [hasPlayerMoved, simulation]);

  useEffect(() => {
    if (isPaused) {
      leftAnim.stopAnimation();
      topAnim.stopAnimation();
    }
  }, [isPaused, leftAnim, topAnim]);

  const resetAnimationContext = useCallback(() => {
    leftAnim.setValue(playerStartLeft);
    topAnim.setValue(playerStartTop);
    simulation.resetCraft(PLAYER_ID, {
      top: playerStartTop,
      left: playerStartLeft,
      facing: defaultPlayerFacing,
    });
    setFacing(defaultPlayerFacing);
    setHasPlayerMoved(false);
  }, [leftAnim, topAnim, simulation]);

  /**
   * Starts a movement leg on one axis: records the segment with the
   * simulation and starts the matching native-driver animation from the
   * simulation's authoritative position.
   */
  const moveAlongAxis = useCallback(
    (
      axis: Axis,
      toValue: number,
      callback?: (result: {finished: boolean}) => void,
    ) => {
      const position = simulation.getPosition(PLAYER_ID);

      if (!position) {
        return;
      }

      const craftSpeed = getPlayerSpeed(thrustersEngagedRef.current);

      simulation.setSegment(PLAYER_ID, {axis, to: toValue, speed: craftSpeed});
      animateCraft({
        animation: axis === 'top' ? topAnim : leftAnim,
        callback,
        craftSpeed,
        from: axis === 'top' ? position.top : position.left,
        toValue,
      });
    },
    [leftAnim, simulation, topAnim],
  );

  const onMove = useCallback(
    (nextFacing: Facing) => {
      const toValue = {N: minTop, S: maxTop, W: minLeft, E: maxLeft}[
        nextFacing
      ];
      const axis: Axis = isHorizontalFacing(nextFacing) ? 'left' : 'top';

      simulation.setFacing(PLAYER_ID, nextFacing);
      setFacing(nextFacing);
      moveAlongAxis(axis, toValue);
    },
    [moveAlongAxis, simulation],
  );

  /**
   * A perpendicular turn first travels to the center of the next alley on
   * the current axis, then starts the requested move. Facing is unchanged
<<<<<<< HEAD
   * until the turn actually happens.
=======
   * until the turn actually happens, exactly like the original engine.
>>>>>>> main
   */
  const interceptToAlley = useCallback(
    (axis: Axis, onDone: () => void) => {
      const position = simulation.getPosition(PLAYER_ID);

      if (!position) {
        return;
      }

      const current = axis === 'top' ? position.top : position.left;
      const nextAlley = getNextAlley(current, facingRef.current);

      moveAlongAxis(axis, nextAlley * totalWidth + 1, ({finished}) => {
        if (finished) {
          onDone();
        }
      });
    },
    [moveAlongAxis, simulation],
  );

  const onDirectionPress = useCallback(
    (nextFacing: Facing) => {
      const isTurningAcross =
        isHorizontalFacing(facingRef.current) !==
        isHorizontalFacing(nextFacing);

      if (isTurningAcross) {
        // Finish travelling to the next alley on the current axis first.
        const alleyAxis: Axis = isHorizontalFacing(facingRef.current)
          ? 'left'
          : 'top';

        interceptToAlley(alleyAxis, () => onMove(nextFacing));
      } else {
        onMove(nextFacing);
      }
    },
    [interceptToAlley, onMove],
  );

  const onUpPress = useCallback(
    () => onDirectionPress('N'),
    [onDirectionPress],
  );
  const onDownPress = useCallback(
    () => onDirectionPress('S'),
    [onDirectionPress],
  );
  const onLeftPress = useCallback(
    () => onDirectionPress('W'),
    [onDirectionPress],
  );
  const onRightPress = useCallback(
    () => onDirectionPress('E'),
    [onDirectionPress],
  );

  // Re-issues movement when thrusters engage/disengage (speed change) and
  // when the game resumes from pause.
  useEffect(() => {
    if (!hasPlayerMoved || isPaused) {
      return;
    }

    const nextFacing =
      thrustersEngagedFacing === null
        ? facingRef.current
        : thrustersEngagedFacing;

    onDirectionPress(nextFacing);
  }, [isPaused, thrustersEngagedFacing]); // eslint-disable-line react-hooks/exhaustive-deps

  const controls = useMemo(
    () => ({
      leftAnim,
      topAnim,
      onDownPress,
      onUpPress,
      onLeftPress,
      onRightPress,
      resetAnimationContext,
      setHasPlayerMoved,
      setThrusterEngagedFacing,
    }),
    [
      leftAnim,
      topAnim,
      onDownPress,
      onUpPress,
      onLeftPress,
      onRightPress,
      resetAnimationContext,
    ],
  );

  return (
    <PlayerControlsContext.Provider value={controls}>
      <PlayerFacingContext.Provider value={facing}>
        <HasPlayerMovedContext.Provider value={hasPlayerMoved}>
          {children}
        </HasPlayerMovedContext.Provider>
      </PlayerFacingContext.Provider>
    </PlayerControlsContext.Provider>
  );
};
