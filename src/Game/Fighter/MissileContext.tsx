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
    missileAnim: new Animated.Value(missileSize / 2),
    missilePosition: new MissilePosition(),
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
  const leftMissilePosition = useRef(new MissilePosition()).current;
  const rightMissilePosition = useRef(new MissilePosition()).current;

  const onFireLeftMissile = useCallback(() => setHasLeftMissileFired(true), []);
  const onFireRightMissile = useCallback(
    () => setHasRightMissileFired(true),
    [],
  );
  const onLeftFireAnimationEnded = useCallback(() => {
    // setHasLeftFireAnimationEnded(true);
    setHasLeftMissileFired(false);
  }, []);
  const onRightFireAnimationEnded = useCallback(() => {
    // setHasRightFireAnimationEnded(true);
    setHasRightMissileFired(false);
  }, []);

  return (
    <MissileContext.Provider
      children={children}
      value={[
        {
          hasMissileFired: hasLeftMissileFired,
          missileAnim: leftMissileAnim,
          missilePosition: leftMissilePosition,
          onFireAnimationEnded: onLeftFireAnimationEnded,
          onFireMissile: onFireLeftMissile,
        },
        {
          hasMissileFired: hasRightMissileFired,
          missileAnim: rightMissileAnim,
          missilePosition: rightMissilePosition,
          onFireAnimationEnded: onRightFireAnimationEnded,
          onFireMissile: onFireRightMissile,
        },
      ]}
    />
  );
};
