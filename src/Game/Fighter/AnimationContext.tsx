import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import {Animated} from 'react-native';

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
import {animateCraft, getNextAlley} from '../utils';

type UpdaterProps = {
  value: number;
};

type AnimationContextValue = {
  facing: Facing;
  hasPlayerMoved: boolean;
  leftAnim: Animated.Value;
  topAnim: Animated.Value;
  leftRef: React.MutableRefObject<number>;
  topRef: React.MutableRefObject<number>;
  onDownPress: () => void;
  onUpPress: () => void;
  onLeftPress: () => void;
  onRightPress: () => void;
  resetAnimationContext: () => void;
  setHasPlayerMoved: (hasPlayerMoved: boolean) => void;
  setThrusterEngagedFacing: (facing: null | Facing) => void;
};

const noop = () => {};

const defaultValue: AnimationContextValue = {
  facing: defaultPlayerFacing,
  hasPlayerMoved: false,
  leftAnim: new Animated.Value(playerStartLeft),
  topAnim: new Animated.Value(playerStartTop),
  leftRef: {current: playerStartLeft},
  topRef: {current: playerStartTop},
  onDownPress: noop,
  onUpPress: noop,
  onLeftPress: noop,
  onRightPress: noop,
  resetAnimationContext: noop,
  setHasPlayerMoved: noop,
  setThrusterEngagedFacing: noop,
};

const AnimationContext = React.createContext(defaultValue);

export const useAnimationContext = () => useContext(AnimationContext);

export const AnimationProvider = ({children}: {children: React.ReactNode}) => {
  const [thrustersEngagedFacing, setThrusterEngagedFacing] =
    useState<null | Facing>(null);
  const [hasPlayerMoved, setHasPlayerMoved] = useState(false);
  const [facing, setFacing] = useState<Facing>(defaultPlayerFacing);
  const facingRef = useRef(facing);
  const leftAnim = useRef(new Animated.Value(playerStartLeft)).current;
  const topAnim = useRef(new Animated.Value(playerStartTop)).current;
  const topRef = useRef(playerStartTop);
  const leftRef = useRef(playerStartLeft);
  const nextRowRef = useRef(getNextAlley(playerStartTop, facing));
  const nextColRef = useRef(getNextAlley(playerStartLeft, facing));
  const craftSpeedRef = useRef(craftPixelsPerSecond);

  craftSpeedRef.current =
    thrustersEngagedFacing === null
      ? craftPixelsPerSecond
      : craftPixelsPerSecond * 1.5;
  facingRef.current = facing;

  const topUpdaterRef = useRef<(props: UpdaterProps) => void>(
    ({value}: UpdaterProps) => {
      nextRowRef.current = getNextAlley(value, facingRef.current);
      topRef.current = value;
    },
  );
  const leftUpdaterRef = useRef<(props: UpdaterProps) => void>(
    ({value}: UpdaterProps) => {
      nextColRef.current = getNextAlley(value, facingRef.current);
      leftRef.current = value;
    },
  );

  useEffect(() => {
    leftAnim.addListener(leftUpdaterRef.current);
    topAnim.addListener(topUpdaterRef.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const resetAnimationContext = useCallback(() => {
    leftAnim.setValue(playerStartLeft);
    topAnim.setValue(playerStartTop);
    setFacing(defaultPlayerFacing);
    setHasPlayerMoved(false);
  }, [leftAnim, topAnim]);

  const interceptVerticalAnimation = useCallback(
    (callback: () => void) => {
      const nextRowPosition = nextRowRef.current * totalWidth + 1;

      leftAnim.stopAnimation();

      animateCraft({
        animation: topAnim,
        callback: ({finished}) => {
          if (finished) {
            callback();
          }
        },
        craftSpeed: craftSpeedRef.current,
        pixelsToMove: Math.abs(nextRowPosition - topRef.current) + 1,
        toValue: nextRowPosition,
      });
    },
    [leftAnim, topAnim],
  );

  const interceptHorizontalAnimation = useCallback(
    (callback: () => void) => {
      const nextColPosition = nextColRef.current * totalWidth + 1;

      topAnim.stopAnimation();

      animateCraft({
        animation: leftAnim,
        callback: ({finished}) => {
          if (finished) {
            callback();
          }
        },
        craftSpeed: craftSpeedRef.current,
        pixelsToMove: Math.abs(nextColPosition - leftRef.current),
        toValue: nextColPosition,
      });
    },
    [leftAnim, topAnim],
  );

  const onVerticalMove = useCallback(
    (onMove: () => void) => {
      if (facingRef.current === 'E' || facingRef.current === 'W') {
        interceptHorizontalAnimation(onMove);
      } else {
        onMove();
      }
    },
    [interceptHorizontalAnimation],
  );

  const onHorizontalMove = useCallback(
    (onMove: () => void) => {
      if (facingRef.current === 'N' || facingRef.current === 'S') {
        interceptVerticalAnimation(onMove);
      } else {
        onMove();
      }
    },
    [interceptVerticalAnimation],
  );

  const onMoveDown = useCallback(() => {
    const pixelsToMove = maxTop - topRef.current;

    animateCraft({
      animation: topAnim,
      craftSpeed: craftSpeedRef.current,
      pixelsToMove,
      toValue: maxTop,
    });
    setFacing('S');
  }, [topAnim]);

  const onMoveUp = useCallback(() => {
    const pixelsToMove = topRef.current;

    animateCraft({
      animation: topAnim,
      craftSpeed: craftSpeedRef.current,
      pixelsToMove,
      toValue: minTop,
    });
    setFacing('N');
  }, [topAnim]);

  const onMoveLeft = useCallback(() => {
    const pixelsToMove = leftRef.current;

    animateCraft({
      animation: leftAnim,
      craftSpeed: craftSpeedRef.current,
      pixelsToMove,
      toValue: minLeft,
    });
    setFacing('W');
  }, [leftAnim]);

  const onMoveRight = useCallback(() => {
    const pixelsToMove = maxLeft - leftRef.current;

    animateCraft({
      animation: leftAnim,
      craftSpeed: craftSpeedRef.current,
      pixelsToMove,
      toValue: maxLeft,
    });
    setFacing('E');
  }, [leftAnim]);

  const onDownPress = useCallback(
    () => onVerticalMove(onMoveDown),
    [onMoveDown, onVerticalMove],
  );

  const onUpPress = useCallback(
    () => onVerticalMove(onMoveUp),
    [onMoveUp, onVerticalMove],
  );

  const onLeftPress = useCallback(
    () => onHorizontalMove(onMoveLeft),
    [onMoveLeft, onHorizontalMove],
  );

  const onRightPress = useCallback(
    () => onHorizontalMove(onMoveRight),
    [onMoveRight, onHorizontalMove],
  );

  useEffect(() => {
    if (!hasPlayerMoved) {
      return;
    }

    const nextFacing =
      thrustersEngagedFacing === null
        ? facingRef.current
        : thrustersEngagedFacing;

    switch (nextFacing) {
      case 'N':
        onUpPress();
        break;
      case 'S':
        onDownPress();
        break;
      case 'E':
        onRightPress();
        break;
      case 'W':
        onLeftPress();
        break;
    }
  }, [thrustersEngagedFacing]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AnimationContext.Provider
      children={children}
      value={{
        facing,
        hasPlayerMoved,
        setHasPlayerMoved,
        leftAnim,
        topAnim,
        leftRef,
        topRef,
        onDownPress,
        onUpPress,
        onLeftPress,
        onRightPress,
        resetAnimationContext,
        setThrusterEngagedFacing,
      }}
    />
  );
};
