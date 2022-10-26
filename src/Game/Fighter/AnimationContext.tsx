import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import {Animated} from 'react-native';

import {
  alleyWidth,
  defaultPlayerFacing,
  maxLeft,
  minLeft,
  maxTop,
  minTop,
  playerStartLeft,
  playerStartTop,
  seperatorWidth,
} from '../gameConstants';
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
};

const noop = () => {};

const leftAnimValue = new Animated.Value(playerStartLeft);
const topAnimValue = new Animated.Value(playerStartTop);

const defaultValue: AnimationContextValue = {
  facing: defaultPlayerFacing,
  hasPlayerMoved: false,
  leftAnim: leftAnimValue,
  topAnim: topAnimValue,
  leftRef: {current: playerStartLeft},
  topRef: {current: playerStartTop},
  onDownPress: noop,
  onUpPress: noop,
  onLeftPress: noop,
  onRightPress: noop,
  resetAnimationContext: noop,
  setHasPlayerMoved: noop,
};

const AnimationContext = React.createContext(defaultValue);

export const useAnimationContext = () => useContext(AnimationContext);

export const AnimationProvider = ({children}: {children: React.ReactNode}) => {
  const [hasPlayerMoved, setHasPlayerMoved] = useState(false);
  const [facing, setFacing] = useState<Facing>(defaultPlayerFacing);
  const facingRef = useRef(facing);
  const topAnim = useRef(topAnimValue).current;
  const leftAnim = useRef(leftAnimValue).current;
  const topRef = useRef(playerStartTop);
  const leftRef = useRef(playerStartLeft);
  const nextRowRef = useRef(getNextAlley(playerStartTop, facing));
  const nextColRef = useRef(getNextAlley(playerStartLeft, facing));

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
    topAnimValue.addListener(topUpdaterRef.current);
    leftAnimValue.addListener(leftUpdaterRef.current);
  }, []);

  const resetAnimationContext = useCallback(() => {
    leftAnim.setValue(playerStartLeft);
    topAnim.setValue(playerStartTop);
    setFacing(defaultPlayerFacing);
    setHasPlayerMoved(false);
  }, [leftAnim, topAnim]);

  const interceptVerticalAnimation = useCallback(
    (callback: () => void) => {
      const nextRowPosition =
        nextRowRef.current * (alleyWidth + seperatorWidth) + 1;

      animateCraft({
        animation: topAnim,
        callback,
        pixelsToMove: Math.abs(nextRowPosition - topRef.current) + 1,
        toValue: nextRowPosition,
      });
    },
    [topAnim],
  );

  const interceptHorizontalAnimation = useCallback(
    (callback: () => void) => {
      const nextColPosition =
        nextColRef.current * (alleyWidth + seperatorWidth) + 1;

      animateCraft({
        animation: leftAnim,
        callback,
        pixelsToMove: Math.abs(nextColPosition - leftRef.current),
        toValue: nextColPosition,
      });
    },
    [leftAnim],
  );

  const onVerticalMove = useCallback(
    (onMove: () => void) => {
      if (!hasPlayerMoved) {
        setHasPlayerMoved(true);
      }
      if (facingRef.current === 'E' || facingRef.current === 'W') {
        interceptHorizontalAnimation(onMove);
      } else {
        onMove();
      }
    },
    [hasPlayerMoved, interceptHorizontalAnimation],
  );

  const onHorizontalMove = useCallback(
    (onMove: () => void) => {
      if (!hasPlayerMoved) {
        setHasPlayerMoved(true);
      }
      if (facingRef.current === 'N' || facingRef.current === 'S') {
        interceptVerticalAnimation(onMove);
      } else {
        onMove();
      }
    },
    [hasPlayerMoved, interceptVerticalAnimation],
  );

  const onMoveDown = useCallback(() => {
    const pixelsToMove = maxTop - topRef.current;

    leftAnim.stopAnimation();
    animateCraft({animation: topAnim, pixelsToMove, toValue: maxTop});
    setFacing('S');
  }, [leftAnim, topAnim]);

  const onMoveUp = useCallback(() => {
    const pixelsToMove = topRef.current;

    leftAnim.stopAnimation();
    animateCraft({animation: topAnim, pixelsToMove, toValue: minTop});
    setFacing('N');
  }, [leftAnim, topAnim]);

  const onMoveLeft = useCallback(() => {
    const pixelsToMove = leftRef.current;

    topAnim.stopAnimation();
    animateCraft({animation: leftAnim, pixelsToMove, toValue: minLeft});
    setFacing('W');
  }, [leftAnim, topAnim]);

  const onMoveRight = useCallback(() => {
    const pixelsToMove = maxLeft - leftRef.current;

    topAnim.stopAnimation();
    animateCraft({animation: leftAnim, pixelsToMove, toValue: maxLeft});
    setFacing('E');
  }, [leftAnim, topAnim]);

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

  return (
    <AnimationContext.Provider
      children={children}
      value={{
        facing,
        hasPlayerMoved,
        leftAnim,
        topAnim,
        leftRef,
        topRef,
        onDownPress,
        onUpPress,
        onLeftPress,
        onRightPress,
        resetAnimationContext,
        setHasPlayerMoved,
      }}
    />
  );
};
