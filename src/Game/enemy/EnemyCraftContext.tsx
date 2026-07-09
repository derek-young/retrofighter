import React, {useCallback, useContext, useMemo, useRef, useState} from 'react';
import {Animated} from 'react-native';

import {Facing, MissileProps} from 'Game/types';
import {DEFAULT_FACING_ROTATION} from 'Game/Craft';
import {Position} from 'Game/engine/Simulation';
import {useMissilePropsState} from 'Game/useMissilePropsState';

import {enemyMissileStartingTop} from './enemyConstants';
import useEnemyCraftAnimation, {AiClass} from './useEnemyCraftAnimation';

interface EnemyCraftContextValue {
  // The cluster-bomb missile state lives here (not in EnemyMissileContext) so
  // every enemy has it — even those with no regular missile — and so the
  // regular missile provider can coordinate with it (fire one at a time).
  clusterMissileProps: MissileProps;
  craftRotation: number;
  facing: Facing;
  frozenPosition: null | Position;
  isEliminated: boolean;
  isPlayerInLineOfSight: boolean;
  leftAnim: Animated.Value;
  topAnim: Animated.Value;
  onEliminationAnimationEnd: () => void;
  onRotationEnd: (rotation: number) => void;
  rotationAnim: Animated.Value;
  simId: string;
}

const noop = () => {};

const defaultValue: EnemyCraftContextValue = {
  clusterMissileProps: {
    hasMissileFired: false,
    missileAnim: new Animated.Value(enemyMissileStartingTop),
    onFireAnimationEnded: noop,
    onFireMissile: noop,
    startingTop: enemyMissileStartingTop,
  },
  craftRotation: 0,
  facing: 'S',
  frozenPosition: null,
  isEliminated: false,
  isPlayerInLineOfSight: false,
  leftAnim: new Animated.Value(0),
  topAnim: new Animated.Value(0),
  onEliminationAnimationEnd: noop,
  onRotationEnd: noop,
  rotationAnim: new Animated.Value(0),
  simId: 'enemy-none',
};

export interface EnemyCraftContextProviderProps {
  aiClass?: AiClass;
  children: React.ReactNode;
  craftSpeedWhenLockedOn?: number;
  defaultCraftSpeed: number;
  defaultFacing?: Facing;
  freezeWhenPlayerDetected?: boolean;
  id: number;
  isEliminated: boolean;
  onEliminationAnimationEnd: () => void;
  onIsEliminated: () => void;
  startingTop?: number;
  startingLeft?: number;
}

const EnemyCraftContext = React.createContext(defaultValue);

export const useEnemyCraftContext = () => useContext(EnemyCraftContext);

export const EnemyCraftContextProvider = ({
  aiClass,
  children,
  craftSpeedWhenLockedOn,
  defaultCraftSpeed,
  defaultFacing = 'S',
  freezeWhenPlayerDetected,
  id,
  isEliminated,
  onEliminationAnimationEnd,
  onIsEliminated,
  startingTop = 0,
  startingLeft = 0,
}: EnemyCraftContextProviderProps) => {
  const simId = `enemy-${id}`;
  // Updated once per completed turn; gates enemy missile fire on the craft
  // visually facing its travel direction. Starts at the spawn facing's
  // rotation (matching rotationAnim) so a craft that has never turned can
  // still fire.
  const [craftRotation, setCraftRotation] = useState(
    DEFAULT_FACING_ROTATION[defaultFacing],
  );
  const rotationAnim = useRef(
    new Animated.Value(DEFAULT_FACING_ROTATION[defaultFacing]),
  ).current;

  const clusterMissileProps = useMissilePropsState(enemyMissileStartingTop);

  const onRotationEnd = useCallback(
    (rotation: number) => setCraftRotation(rotation),
    [],
  );

  const {facing, frozenPosition, isPlayerInLineOfSight, leftAnim, topAnim} =
    useEnemyCraftAnimation({
      aiClass,
      craftSpeedWhenLockedOn,
      defaultCraftSpeed,
      defaultFacing,
      freezeWhenPlayerDetected,
      isEliminated,
      onIsEliminated,
      simId,
      startingLeft,
      startingTop,
    });

  const value = useMemo(
    () => ({
      clusterMissileProps,
      craftRotation,
      facing,
      frozenPosition,
      isEliminated,
      isPlayerInLineOfSight,
      leftAnim,
      topAnim,
      onEliminationAnimationEnd,
      onRotationEnd,
      rotationAnim,
      simId,
    }),
    [
      clusterMissileProps,
      craftRotation,
      facing,
      frozenPosition,
      isEliminated,
      isPlayerInLineOfSight,
      leftAnim,
      topAnim,
      onEliminationAnimationEnd,
      onRotationEnd,
      rotationAnim,
      simId,
    ],
  );

  return (
    <EnemyCraftContext.Provider value={value}>
      {children}
    </EnemyCraftContext.Provider>
  );
};
