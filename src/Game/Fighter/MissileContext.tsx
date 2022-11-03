import React, {useCallback, useContext, useRef, useState} from 'react';
import {Animated} from 'react-native';

import {missileSize} from 'Game/constants';
import {MissileProps} from 'Game/types';
import MissilePosition from 'Game/missilePositionFactory';

type MissileContextValue = MissileProps[];

const noop = () => {};

const defaultValue: MissileContextValue = [
  {
    hasMissileFired: false,
    hasMissileImpacted: false,
    missileAnim: new Animated.Value(missileSize / 2),
    missilePosition: new MissilePosition(),
    onFireMissile: noop,
    onMissileImpact: noop,
    resetMissileState: noop,
  },
];

const MissileContext = React.createContext(defaultValue);

export const useMissileContext = () => useContext(MissileContext);

export const MissileProvider = ({children}: {children: React.ReactNode}) => {
  const [hasLeftMissileFired, setHasLeftMissileFired] = useState(false);
  const [hasRightMissileFired, setHasRightMissileFired] = useState(false);
  const [hasLeftMissileImpacted, setHasLeftMissileImpacted] = useState(false);
  const [hasRightMissileImpacted, setHasRightMissileImpacted] = useState(false);
  const leftMissileAnim = useRef(new Animated.Value(missileSize / 2)).current;
  const rightMissileAnim = useRef(new Animated.Value(missileSize / 2)).current;
  const leftMissilePosition = useRef(new MissilePosition()).current;
  const rightMissilePosition = useRef(new MissilePosition()).current;

  const onFireLeftMissile = useCallback(() => setHasLeftMissileFired(true), []);
  const onFireRightMissile = useCallback(
    () => setHasRightMissileFired(true),
    [],
  );
  const onLeftMissileImpact = useCallback(
    () => setHasLeftMissileImpacted(true),
    [],
  );
  const onRightMissileImpact = useCallback(
    () => setHasRightMissileImpacted(true),
    [],
  );
  const resetLeftMissileState = useCallback(() => {
    setHasLeftMissileFired(false);
    setHasLeftMissileImpacted(false);
  }, []);
  const resetRightMissileState = useCallback(() => {
    setHasRightMissileFired(false);
    setHasRightMissileImpacted(false);
  }, []);

  return (
    <MissileContext.Provider
      children={children}
      value={[
        {
          hasMissileFired: hasLeftMissileFired,
          hasMissileImpacted: hasLeftMissileImpacted,
          missileAnim: leftMissileAnim,
          missilePosition: leftMissilePosition,
          onFireMissile: onFireLeftMissile,
          onMissileImpact: onLeftMissileImpact,
          resetMissileState: resetLeftMissileState,
        },
        {
          hasMissileFired: hasRightMissileFired,
          hasMissileImpacted: hasRightMissileImpacted,
          missileAnim: rightMissileAnim,
          missilePosition: rightMissilePosition,
          onFireMissile: onFireRightMissile,
          onMissileImpact: onRightMissileImpact,
          resetMissileState: resetRightMissileState,
        },
      ]}
    />
  );
};
