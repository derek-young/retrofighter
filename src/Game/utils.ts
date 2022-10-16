import {Animated, Easing} from 'react-native';

import {Facing} from './types';
import {alleyWidth, pixelsPerSecond, seperatorWidth} from './gameConstants';

export function animate({
  animation,
  callback = () => {},
  pixelsToMove,
  toValue,
}: {
  animation: Animated.Value;
  callback?: () => void;
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

export function getNextAlley(position: number, direction: Facing) {
  const nextAlley = position / (alleyWidth + seperatorWidth);

  console.log('position', position);
  console.log('direction', direction);
  console.log('alleyWidth + seperatorWidth', alleyWidth + seperatorWidth);

  if (direction === 'N' || direction === 'W') {
    return Math.floor(nextAlley);
  }

  return Math.ceil(nextAlley);
}
