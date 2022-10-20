import {Animated, Easing} from 'react-native';

import {Facing} from './types';
import {pixelsPerSecond, totalWidth} from './gameConstants';

export function animateCraft({
  animation,
  callback = () => {},
  pixelsToMove,
  toValue,
}: {
  animation: Animated.Value;
  callback?: (value: {finished: boolean}) => void;
  pixelsToMove: number;
  toValue: number;
}) {
  const durationMs = (pixelsToMove / pixelsPerSecond) * 1000;

  Animated.timing(animation, {
    toValue,
    duration: durationMs,
    easing: Easing.linear,
    useNativeDriver: false,
  }).start(callback);
}

export function isHorizontalFacing(facing: Facing) {
  return facing === 'E' || facing === 'W';
}

export function isVerticalFacing(facing: Facing) {
  return facing === 'N' || facing === 'S';
}

export function getNextAlley(position: number, direction: Facing) {
  const nextAlley = position / totalWidth;

  if (direction === 'N' || direction === 'W') {
    return Math.floor(nextAlley);
  }

  return Math.ceil(nextAlley);
}
