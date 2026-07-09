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
import {useItemFactoryContext} from 'Game/items/ItemFactoryContext';

import {enemyMissileStartingTop} from './enemyConstants';
import {useEnemyCraftContext} from './EnemyCraftContext';

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
  const {
    clusterMissileProps,
    craftRotation,
    facing,
    isPlayerInLineOfSight,
    simId,
  } = useEnemyCraftContext();
  const {effects} = useItemFactoryContext();
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

  const clusterBombCount = effects[simId]?.clusterBombCount ?? 0;

  // Fires shortly after the player is spotted, once the craft has visually
  // finished rotating toward its travel direction. A held cluster bomb takes
  // priority, and the craft never fires this while a bomb is mid-flight, so
  // only one missile is ever in the air at a time.
  useEffect(() => {
    if (
      !hasMissileFired &&
      clusterBombCount === 0 &&
      !clusterMissileProps.hasMissileFired &&
      isPlayerInLineOfSight &&
      DEFAULT_FACING_ROTATION[facing] === craftRotation
    ) {
      const timeoutId = setTimeout(onFireMissile, 400);

      return () => clearTimeout(timeoutId);
    }
  }, [
    clusterBombCount,
    clusterMissileProps.hasMissileFired,
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
