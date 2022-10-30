import React, {useCallback, useContext, useEffect, useState} from 'react';
import {Animated} from 'react-native';

import {Facing} from 'Game/types';
import {useAnimationContext} from 'Game/Fighter/AnimationContext';

import useCollisionDetector from './useCollisionDetector';
import useMissileImpactDetector from './useMissileImpactDetector';
import useEnemyCraftAnimation from './useEnemyCraftAnimation';

interface EnemyCraftContextValue {
  craftRotation: number;
  setCraftRotation: (craftRotation: number) => void;
  facing: Facing;
  hasEliminationAnimationEnded: boolean;
  setHasEliminationAnimationEnded: (
    hasEliminationAnimationEnded: boolean,
  ) => void;
  isEliminated: boolean;
  isPlayerInLineOfSight: boolean;
  leftAnim: Animated.Value;
  topAnim: Animated.Value;
  onRotationChange: (p: {value: number}) => void;
}

const noop = () => {};

const defaultValue: EnemyCraftContextValue = {
  craftRotation: 0,
  setCraftRotation: noop,
  facing: 'S',
  hasEliminationAnimationEnded: false,
  setHasEliminationAnimationEnded: noop,
  isEliminated: false,
  isPlayerInLineOfSight: false,
  leftAnim: new Animated.Value(0),
  topAnim: new Animated.Value(0),
  onRotationChange: noop,
};

export interface EnemyCraftContextProviderProps {
  children: React.ReactNode;
  craftSpeedWhenLockedOn?: number;
  defaultFacing?: Facing;
  startingTop?: number;
  startingLeft?: number;
}

const EnemyCraftContext = React.createContext(defaultValue);

export const useEnemyCraftContext = () => useContext(EnemyCraftContext);

export const EnemyCraftContextProvider = ({
  children,
  craftSpeedWhenLockedOn,
  defaultFacing = 'S',
  startingTop = 0,
  startingLeft = 0,
}: EnemyCraftContextProviderProps) => {
  const {hasPlayerMoved} = useAnimationContext();
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isEliminated, setIsEliminated] = useState(false);
  const [hasEliminationAnimationEnded, setHasEliminationAnimationEnded] =
    useState(false);
  const [craftRotation, setCraftRotation] = useState(0);

  const onRotationChange = useCallback(
    ({value}: {value: number}) => setCraftRotation(Math.round(value)),
    [],
  );

  const {facing, initialize, isPlayerInLineOfSight, leftAnim, topAnim} =
    useEnemyCraftAnimation({
      craftSpeedWhenLockedOn,
      defaultFacing,
      hasEliminationAnimationEnded,
      startingLeft,
      startingTop,
    });

  useMissileImpactDetector({
    isEliminated,
    leftAnim,
    topAnim,
    startingLeft,
    startingTop,
    setIsEliminated,
  });

  useCollisionDetector({
    hasPlayerMoved,
    isEliminated,
    leftAnim,
    topAnim,
    startingLeft,
    startingTop,
    setIsEliminated,
  });

  useEffect(() => {
    if (hasPlayerMoved && !hasInitialized) {
      initialize();
      setHasInitialized(true);
    }
  }, [hasInitialized, hasPlayerMoved, initialize]);

  return (
    <EnemyCraftContext.Provider
      children={children}
      value={{
        craftRotation,
        setCraftRotation,
        facing,
        hasEliminationAnimationEnded,
        setHasEliminationAnimationEnded,
        isEliminated,
        isPlayerInLineOfSight,
        leftAnim,
        topAnim,
        onRotationChange,
      }}
    />
  );
};
