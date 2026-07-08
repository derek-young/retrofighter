import {Animated, Easing} from 'react-native';

import {Facing} from './types';
import {
  Enemies,
  craftPixelsPerSecond,
  numColumns,
  parSecondsPerEnemy,
  startingEnemies,
  timeBonusPointsPerSecond,
  totalWidth,
} from './constants';

export function animateCraft({
  animation,
  callback = () => {},
  craftSpeed = craftPixelsPerSecond,
  from,
  toValue,
}: {
  animation: Animated.Value;
  callback?: (value: {finished: boolean}) => void;
  craftSpeed?: number;
  from: number;
  toValue: number;
}) {
  const durationMs = (Math.abs(toValue - from) / craftSpeed) * 1000;

  animation.setValue(from);
  Animated.timing(animation, {
    toValue,
    duration: durationMs,
    easing: Easing.linear,
    useNativeDriver: true,
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
    return Math.min(numColumns - 1, Math.floor(nextAlley));
  }

  return Math.min(numColumns - 1, Math.ceil(nextAlley));
}

export function getParSeconds(epic: number) {
  const enemyCount = startingEnemies[epic].reduce((count: number, enemy) => {
    if (enemy === null) {
      return count;
    }

    // A cargo ship converts into three speeders when it detects the player,
    // so it takes three kills' worth of time to fully clear.
    return count + (enemy === Enemies.CARGO_SHIP ? 3 : 1);
  }, 0);

  return enemyCount * parSecondsPerEnemy;
}

export function getTimeBonus(epic: number, elapsedSeconds: number) {
  const secondsUnderPar = Math.max(0, getParSeconds(epic) - elapsedSeconds);

  return Math.round((timeBonusPointsPerSecond * secondsUnderPar) / 10) * 10;
}

export function getIsThanksgivingDay() {
  const today = new Date();
  const isNovember = today.getMonth() === 10;
  const isThursday = today.getDay() === 4;
  const daysRemainingInMonth = 30 - today.getDate();
  const isLastThursdayBeforeAFullWeekend =
    daysRemainingInMonth >= 2 && daysRemainingInMonth <= 7;
  const isThanksgivingDay =
    isNovember && isThursday && isLastThursdayBeforeAFullWeekend;

  return isThanksgivingDay;
}
