import React, {useContext, useMemo} from 'react';
import {Animated} from 'react-native';

import {missileSize} from 'Game/constants';
import {MissileProps} from 'Game/types';
import {useMissilePropsState} from 'Game/useMissilePropsState';

// [left, right, clusterBomb]
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
  const leftMissile = useMissilePropsState(missileSize / 2);
  const rightMissile = useMissilePropsState(missileSize / 2);
  const clusterBombMissile = useMissilePropsState(missileSize / 2);

  const value = useMemo(
    () => [leftMissile, rightMissile, clusterBombMissile],
    [leftMissile, rightMissile, clusterBombMissile],
  );

  return (
    <MissileContext.Provider value={value}>{children}</MissileContext.Provider>
  );
};
