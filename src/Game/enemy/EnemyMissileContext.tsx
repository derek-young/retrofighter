import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {Animated} from 'react-native';

import {DEFAULT_FACING_ROTATION} from 'Game/Craft';
import {MissileProps} from 'Game/types';
import {missileDuration, playerStartLeft, playerStartTop} from 'Game/constants';
import MissilePosition from 'Game/missilePositionFactory';

import {useEnemyCraftContext} from './EnemyCraftContext';
import useMissileImpactDetector from './useMissileImpactDetector';
import {useAnimationContext} from 'Game/Fighter/AnimationContext';
import {useEliminationContext} from 'Game/Fighter/EliminationContext';

const enemyMissileStartingTop = 12;

const noop = () => {};

const defaultValue: MissileProps = {
  hasMissileFired: false,
  missileAnim: new Animated.Value(enemyMissileStartingTop),
  missilePosition: new MissilePosition(),
  onFireAnimationEnded: noop,
  onFireMissile: noop,
};

interface EnemyMissileProviderProps {
  children: React.ReactNode;
}

const EnemyMissileContext = React.createContext(defaultValue);

export const useEnemyMissileContext = () => useContext(EnemyMissileContext);

export const EnemyMissileProvider = ({children}: EnemyMissileProviderProps) => {
  const {
    hasPlayerMoved,
    leftAnim: playerLeftAnim,
    topAnim: playerTopAnim,
  } = useAnimationContext();
  const {isPlayerEliminated, onIsPlayerEliminated} = useEliminationContext();
  const {craftRotation, facing, isPlayerInLineOfSight} = useEnemyCraftContext();
  const [hasMissileFired, setHasMissileFired] = useState(false);
  const missileAnimRef = useRef(new Animated.Value(enemyMissileStartingTop));
  const missilePositionRef = useRef(new MissilePosition());
  const timeoutIdRef = useRef<number | undefined>();

  const onFireAnimationEnded = useCallback(() => setHasMissileFired(false), []);
  const onFireMissile = useCallback(() => {
    if (!hasMissileFired) {
      setHasMissileFired(true);
      setTimeout(onFireAnimationEnded, missileDuration);
    }
  }, [hasMissileFired, onFireAnimationEnded]);

  const missileProps: MissileProps = useMemo(
    () => ({
      hasMissileFired,
      missileAnim: missileAnimRef.current,
      missilePosition: missilePositionRef.current,
      onFireAnimationEnded,
      onFireMissile,
      startingTop: enemyMissileStartingTop,
    }),
    [hasMissileFired, onFireAnimationEnded, onFireMissile],
  );

  useMissileImpactDetector({
    isTargetable: !isPlayerEliminated && hasPlayerMoved,
    leftAnim: playerLeftAnim,
    topAnim: playerTopAnim,
    missile: missileProps,
    startingLeft: playerStartLeft,
    startingTop: playerStartTop,
    onIsEliminated: onIsPlayerEliminated,
  });

  useEffect(() => {
    if (
      !hasMissileFired &&
      isPlayerInLineOfSight &&
      DEFAULT_FACING_ROTATION[facing] === craftRotation
    ) {
      timeoutIdRef.current = setTimeout(onFireMissile, 400);
    }

    if (!isPlayerInLineOfSight && timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }
  }, [
    craftRotation,
    facing,
    hasMissileFired,
    isPlayerInLineOfSight,
    onFireMissile,
  ]);

  useEffect(() => () => missileAnimRef.current.removeAllListeners(), []);

  return (
    <EnemyMissileContext.Provider children={children} value={missileProps} />
  );
};
