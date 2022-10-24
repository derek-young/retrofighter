import React, {useCallback, useContext, useRef, useState} from 'react';
import {Animated} from 'react-native';

import {missileSize} from 'Game/gameConstants';

interface MissileValue {
  hasMissileFired: boolean;
  hasMissileImpacted: boolean;
  missileAnim: Animated.Value;
  onFireMissile: () => void;
}

type MissileContextValue = MissileValue[];

const noop = () => {};

const defaultValue: MissileContextValue = [
  {
    hasMissileFired: false,
    hasMissileImpacted: false,
    missileAnim: new Animated.Value(missileSize / 2),
    onFireMissile: noop,
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

  const onFireLeftMissile = useCallback(() => setHasLeftMissileFired(true), []);
  const onFireRightMissile = useCallback(
    () => setHasRightMissileFired(true),
    [],
  );

  return (
    <MissileContext.Provider
      children={children}
      value={[
        {
          hasMissileFired: hasLeftMissileFired,
          hasMissileImpacted: hasLeftMissileImpacted,
          missileAnim: leftMissileAnim,
          onFireMissile: onFireLeftMissile,
        },
        {
          hasMissileFired: hasRightMissileFired,
          hasMissileImpacted: hasRightMissileImpacted,
          missileAnim: rightMissileAnim,
          onFireMissile: onFireRightMissile,
        },
      ]}
    />
  );
};
