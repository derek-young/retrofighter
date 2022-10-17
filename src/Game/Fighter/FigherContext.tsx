import React, {useContext, useEffect, useRef, useState} from 'react';

import {Animated} from 'react-native';

import {
  alleyWidth,
  maxLeft,
  minLeft,
  maxTop,
  minTop,
  seperatorWidth,
} from '../gameConstants';
import {Facing} from '../types';
import {animate, getNextAlley} from '../utils';

type UpdaterProps = {
  value: number;
};

type FigherValue = {
  facing: Facing;
  topAnim: Animated.Value;
  leftAnim: Animated.Value;
  onDownPress: () => void;
  onUpPress: () => void;
  onLeftPress: () => void;
  onRightPress: () => void;
};

const noop = () => {};

const startTop = maxTop;
const startLeft = minLeft;
const topAnimValue = new Animated.Value(startTop);
const leftAnimValue = new Animated.Value(startLeft);

const defaultValue: FigherValue = {
  facing: 'N',
  topAnim: topAnimValue,
  leftAnim: leftAnimValue,
  onDownPress: noop,
  onUpPress: noop,
  onLeftPress: noop,
  onRightPress: noop,
};

const FighterContext = React.createContext(defaultValue);

export const useFighterContext = () => useContext(FighterContext);

export const FighterProvider = ({children}: {children: React.ReactNode}) => {
  const [facing, setFacing] = useState<Facing>('N');
  const facingRef = useRef(facing);

  const topAnim = useRef(topAnimValue).current;
  const leftAnim = useRef(leftAnimValue).current;

  const topRef = useRef(startTop);
  const leftRef = useRef(startLeft);

  const nextRowRef = useRef(getNextAlley(startTop, facing));
  const nextColRef = useRef(getNextAlley(startLeft, facing));

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

  const interceptVerticalAnimation = (callback: () => void) => {
    const nextRowPosition =
      nextRowRef.current * (alleyWidth + seperatorWidth) + 1;

    animate({
      animation: topAnim,
      callback,
      pixelsToMove: Math.abs(nextRowPosition - topRef.current) + 1,
      toValue: nextRowPosition,
    });
  };

  const interceptHorizontalAnimation = (callback: () => void) => {
    const nextColPosition =
      nextColRef.current * (alleyWidth + seperatorWidth) + 1;

    animate({
      animation: leftAnim,
      callback,
      pixelsToMove: Math.abs(nextColPosition - leftRef.current),
      toValue: nextColPosition,
    });
  };

  const onVerticalMove = (onMove: () => void) => {
    if (facingRef.current === 'E' || facingRef.current === 'W') {
      interceptHorizontalAnimation(onMove);
    } else {
      onMove();
    }
  };

  const onHorizontalMove = (onMove: () => void) => {
    if (facingRef.current === 'N' || facingRef.current === 'S') {
      interceptVerticalAnimation(onMove);
    } else {
      onMove();
    }
  };

  const onMoveDown = () => {
    const pixelsToMove = maxTop - topRef.current;

    leftAnim.stopAnimation();
    animate({animation: topAnim, pixelsToMove, toValue: maxTop});
    setFacing('S');
  };

  const onMoveUp = () => {
    const pixelsToMove = topRef.current;

    leftAnim.stopAnimation();
    animate({animation: topAnim, pixelsToMove, toValue: minTop});
    setFacing('N');
  };

  const onMoveLeft = () => {
    const pixelsToMove = leftRef.current;

    topAnim.stopAnimation();
    animate({animation: leftAnim, pixelsToMove, toValue: minLeft});
    setFacing('W');
  };

  const onMoveRight = () => {
    const pixelsToMove = maxLeft - leftRef.current;

    topAnim.stopAnimation();
    animate({animation: leftAnim, pixelsToMove, toValue: maxLeft});
    setFacing('E');
  };

  const onDownPress = () => onVerticalMove(onMoveDown);

  const onUpPress = () => onVerticalMove(onMoveUp);

  const onLeftPress = () => onHorizontalMove(onMoveLeft);

  const onRightPress = () => onHorizontalMove(onMoveRight);

  return (
    <FighterContext.Provider
      children={children}
      value={{
        facing,
        topAnim,
        leftAnim,
        onDownPress,
        onUpPress,
        onLeftPress,
        onRightPress,
      }}
    />
  );
};
