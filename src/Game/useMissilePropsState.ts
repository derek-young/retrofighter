import {useCallback, useMemo, useRef, useState} from 'react';
import {Animated} from 'react-native';

import {MissileProps} from 'Game/types';

/**
 * The per-missile state bundle shared by every fireable missile: a fired
 * flag, the travel animation value, and the fire/reset callbacks.
 */
export function useMissilePropsState(startingTop: number): MissileProps {
  const [hasMissileFired, setHasMissileFired] = useState(false);
  const missileAnim = useRef(new Animated.Value(startingTop)).current;

  const onFireMissile = useCallback(() => setHasMissileFired(true), []);
  const onFireAnimationEnded = useCallback(
    () => setHasMissileFired(false),
    [],
  );

  return useMemo(
    () => ({
      hasMissileFired,
      missileAnim,
      onFireAnimationEnded,
      onFireMissile,
      startingTop,
    }),
    [
      hasMissileFired,
      missileAnim,
      onFireAnimationEnded,
      onFireMissile,
      startingTop,
    ],
  );
}
