import {Animated, Easing} from 'react-native';

import {Facing} from './types';
import {
  Enemies,
  craftPixelsPerSecond,
  earnablePoints,
  numColumns,
  parSecondsPerEnemy,
  startingEnemies,
  timeBonusPointsPerSecond,
  totalWidth,
  veteranParSecondsPerEnemy,
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

const veteranEnemies = new Set([
  Enemies.VETERAN_CARGO_SHIP,
  Enemies.VETERAN_DUAL_FIGHTER,
  Enemies.VETERAN_SPEEDER,
  Enemies.VETERAN_UAV,
]);

export function getParSeconds(epic: number) {
  return startingEnemies[epic].reduce((seconds: number, enemy) => {
    if (enemy === null) {
      return seconds;
    }

    // A cargo ship (basic or veteran) converts into three speeders of its
    // tier when it detects the player, so it takes three kills' worth of
    // time to clear.
    const isCargoShip =
      enemy === Enemies.CARGO_SHIP || enemy === Enemies.VETERAN_CARGO_SHIP;
    const secondsPerKill = veteranEnemies.has(enemy)
      ? veteranParSecondsPerEnemy
      : parSecondsPerEnemy;

    return seconds + (isCargoShip ? 3 : 1) * secondsPerKill;
  }, 0);
}

export function getTimeBonus(epic: number, elapsedSeconds: number) {
  const secondsUnderPar = Math.max(0, getParSeconds(epic) - elapsedSeconds);

  return Math.round((timeBonusPointsPerSecond * secondsUnderPar) / 10) * 10;
}

/**
 * The theoretical maximum total score: every enemy slot's earnable points
 * plus the full time bonus (a par-time-zero finish) on every level.
 */
export function getMaxPossibleScore() {
  return startingEnemies.reduce((total, enemies, epic) => {
    const killPoints = enemies.reduce(
      (points: number, enemy) =>
        enemy === null ? points : points + earnablePoints[enemy],
      0,
    );

    return total + killPoints + getParSeconds(epic) * timeBonusPointsPerSecond;
  }, 0);
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
