import React, {useCallback, useContext, useState} from 'react';
import {Animated} from 'react-native';

import {Facing} from 'Game/types';
import {useMissileContext} from 'Game/Fighter/MissileContext';

import useCollisionDetector from './useCollisionDetector';
import useMissileImpactDetector from './useMissileImpactDetector';
import useEnemyCraftAnimation from './useEnemyCraftAnimation';

interface EnemyCraftContextValue {
  craftRotation: number;
  setCraftRotation: (craftRotation: number) => void;
  facing: Facing;
  isEliminated: boolean;
  isPlayerInLineOfSight: boolean;
  leftAnim: Animated.Value;
  topAnim: Animated.Value;
  onEliminationAnimationEnd: () => void;
  onRotationChange: (p: {value: number}) => void;
}

const noop = () => {};

const defaultValue: EnemyCraftContextValue = {
  craftRotation: 0,
  setCraftRotation: noop,
  facing: 'S',
  isEliminated: false,
  isPlayerInLineOfSight: false,
  leftAnim: new Animated.Value(0),
  topAnim: new Animated.Value(0),
  onEliminationAnimationEnd: noop,
  onRotationChange: noop,
};

export interface EnemyCraftContextProviderProps {
  children: React.ReactNode;
  craftSpeedWhenLockedOn?: number;
  defaultCraftSpeed: number;
  defaultFacing?: Facing;
  isEliminated: boolean;
  onEliminationAnimationEnd: () => void;
  onIsEliminated: () => void;
  startingTop?: number;
  startingLeft?: number;
}

const EnemyCraftContext = React.createContext(defaultValue);

export const useEnemyCraftContext = () => useContext(EnemyCraftContext);

export const EnemyCraftContextProvider = ({
  children,
  craftSpeedWhenLockedOn,
  defaultCraftSpeed,
  defaultFacing = 'S',
  isEliminated,
  onEliminationAnimationEnd,
  onIsEliminated,
  startingTop = 0,
  startingLeft = 0,
}: EnemyCraftContextProviderProps) => {
  const playerMissiles = useMissileContext();
  const [craftRotation, setCraftRotation] = useState(0);

  const onRotationChange = useCallback(
    ({value}: {value: number}) => setCraftRotation(Math.round(value)),
    [],
  );

  const {facing, isPlayerInLineOfSight, leftAnim, topAnim} =
    useEnemyCraftAnimation({
      craftSpeedWhenLockedOn,
      defaultCraftSpeed,
      defaultFacing,
      isEliminated,
      startingLeft,
      startingTop,
    });

  useMissileImpactDetector({
    isTargetable: !isEliminated,
    leftAnim,
    topAnim,
    missile: playerMissiles[0],
    startingLeft,
    startingTop,
    onIsEliminated,
  });

  useMissileImpactDetector({
    isTargetable: !isEliminated,
    leftAnim,
    topAnim,
    missile: playerMissiles[1],
    startingLeft,
    startingTop,
    onIsEliminated,
  });

  useCollisionDetector({
    isEliminated,
    leftAnim,
    topAnim,
    startingLeft,
    startingTop,
    onIsEliminated,
  });

  return (
    <EnemyCraftContext.Provider
      children={children}
      value={{
        craftRotation,
        setCraftRotation,
        facing,
        isEliminated,
        isPlayerInLineOfSight,
        leftAnim,
        topAnim,
        onEliminationAnimationEnd,
        onRotationChange,
      }}
    />
  );
};
