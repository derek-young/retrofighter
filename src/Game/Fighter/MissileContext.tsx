import React, {useCallback, useContext, useMemo, useRef, useState} from 'react';
import {Animated} from 'react-native';

import {missileSize} from 'Game/constants';
import {MissileProps} from 'Game/types';

type MissileContextValue = MissileProps[];

const noop = () => {};

const defaultValue: MissileContextValue = [
  {
    hasMissileFired: false,
    missileAnim: new Animated.Value(missileSize / 2),
    onFireAnimationEnded: noop,
    onFireMissile: noop,
  },
];

const MissileContext = React.createContext(defaultValue);

export const useMissileContext = () => useContext(MissileContext);

export const MissileProvider = ({children}: {children: React.ReactNode}) => {
  const [hasLeftMissileFired, setHasLeftMissileFired] = useState(false);
  const [hasRightMissileFired, setHasRightMissileFired] = useState(false);
  const leftMissileAnim = useRef(new Animated.Value(missileSize / 2)).current;
  const rightMissileAnim = useRef(new Animated.Value(missileSize / 2)).current;

  const onFireLeftMissile = useCallback(() => setHasLeftMissileFired(true), []);
  const onFireRightMissile = useCallback(
    () => setHasRightMissileFired(true),
    [],
  );
  const onLeftFireAnimationEnded = useCallback(
    () => setHasLeftMissileFired(false),
    [],
  );
  const onRightFireAnimationEnded = useCallback(
    () => setHasRightMissileFired(false),
    [],
  );

  const value = useMemo(
    () => [
      {
        hasMissileFired: hasLeftMissileFired,
        missileAnim: leftMissileAnim,
        onFireAnimationEnded: onLeftFireAnimationEnded,
        onFireMissile: onFireLeftMissile,
      },
      {
        hasMissileFired: hasRightMissileFired,
        missileAnim: rightMissileAnim,
        onFireAnimationEnded: onRightFireAnimationEnded,
        onFireMissile: onFireRightMissile,
      },
    ],
    [
      hasLeftMissileFired,
      hasRightMissileFired,
      leftMissileAnim,
      rightMissileAnim,
      onLeftFireAnimationEnded,
      onRightFireAnimationEnded,
      onFireLeftMissile,
      onFireRightMissile,
    ],
  );

  return (
    <MissileContext.Provider value={value}>{children}</MissileContext.Provider>
  );
};
