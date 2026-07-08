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

import {useEnemyCraftContext} from './EnemyCraftContext';

const enemyMissileStartingTop = 12;

const noop = () => {};

const defaultValue: MissileProps = {
  hasMissileFired: false,
  missileAnim: new Animated.Value(enemyMissileStartingTop),
  onFireAnimationEnded: noop,
  onFireMissile: noop,
};

interface EnemyMissileProviderProps {
  children: React.ReactNode;
}

const EnemyMissileContext = React.createContext(defaultValue);

export const useEnemyMissileContext = () => useContext(EnemyMissileContext);

export const EnemyMissileProvider = ({children}: EnemyMissileProviderProps) => {
  const {craftRotation, facing, isPlayerInLineOfSight} = useEnemyCraftContext();
  const [hasMissileFired, setHasMissileFired] = useState(false);
  const missileAnimRef = useRef(new Animated.Value(enemyMissileStartingTop));

  const onFireAnimationEnded = useCallback(() => setHasMissileFired(false), []);
  const onFireMissile = useCallback(() => setHasMissileFired(true), []);

  const missileProps: MissileProps = useMemo(
    () => ({
      hasMissileFired,
      missileAnim: missileAnimRef.current,
      onFireAnimationEnded,
      onFireMissile,
      startingTop: enemyMissileStartingTop,
    }),
    [hasMissileFired, onFireAnimationEnded, onFireMissile],
  );

  // Fires shortly after the player is spotted, once the craft has visually
  // finished rotating toward its travel direction.
  useEffect(() => {
    if (
      !hasMissileFired &&
      isPlayerInLineOfSight &&
      DEFAULT_FACING_ROTATION[facing] === craftRotation
    ) {
      const timeoutId = setTimeout(onFireMissile, 400);

      return () => clearTimeout(timeoutId);
    }
  }, [
    craftRotation,
    facing,
    hasMissileFired,
    isPlayerInLineOfSight,
    onFireMissile,
  ]);

  return (
    <EnemyMissileContext.Provider value={missileProps}>
      {children}
    </EnemyMissileContext.Provider>
  );
};
