import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Animated} from 'react-native';

import Colors from 'types/colors';
import {DEFAULT_FACING_ROTATION} from 'Game/Craft';
import {
  missileDuration,
  missileSize,
  playerStartLeft,
  playerStartTop,
} from 'Game/gameConstants';
import MissilePosition from 'Game/missilePositionFactory';
import Missile from 'Game/Missile';
import EnemyMissileIcon from 'icons/skull.svg';

import {useEnemyCraftContext} from './EnemyCraftContext';
import useMissileImpactDetector from './useMissileImpactDetector';
import {useAnimationContext} from 'Game/Fighter/AnimationContext';
import {useEliminationContext} from 'Game/Fighter/EliminationContext';

interface EnemyMissileProps {
  craftColor?: string;
}

const EnemyMissile = ({
  craftColor = Colors.RED,
}: EnemyMissileProps): null | JSX.Element => {
  const {leftAnim: playerLeftAnim, topAnim: playerTopAnim} =
    useAnimationContext();
  const {isPlayerEliminated, onIsPlayerEliminated} = useEliminationContext();
  const {
    craftRotation,
    facing,
    isEliminated,
    isPlayerInLineOfSight,
    leftAnim,
    topAnim,
  } = useEnemyCraftContext();
  const [hasMissileFired, setHasMissileFired] = useState(false);
  const [hasMissileImpacted, setHasMissileImpacted] = useState(false);
  const missileAnim = useRef(new Animated.Value(6)).current;
  const missilePosition = useRef(new MissilePosition()).current;
  const readyToFire = !hasMissileFired && !hasMissileImpacted;

  const resetMissileState = useCallback(() => {
    missileAnim.setValue(6);
    setHasMissileImpacted(false);
    setHasMissileFired(false);
  }, [missileAnim]);

  const onFireMissile = useCallback(() => {
    if (readyToFire) {
      setHasMissileFired(true);
      setTimeout(resetMissileState, missileDuration);
    }
  }, [readyToFire, resetMissileState]);
  const onMissileImpact = useCallback(() => setHasMissileImpacted(true), []);

  const missileProps = {
    hasMissileFired,
    hasMissileImpacted,
    missileAnim,
    missilePosition,
    onFireMissile,
    onMissileImpact,
    resetMissileState,
    startingTop: 6,
  };

  useMissileImpactDetector({
    isEliminated: isPlayerEliminated,
    leftAnim: playerLeftAnim,
    topAnim: playerTopAnim,
    missiles: [missileProps],
    startingLeft: playerStartLeft,
    startingTop: playerStartTop,
    setIsEliminated: onIsPlayerEliminated,
  });

  useEffect(() => {
    if (
      readyToFire &&
      isPlayerInLineOfSight &&
      DEFAULT_FACING_ROTATION[facing] === craftRotation
    ) {
      onFireMissile();
    }
  }, [
    craftRotation,
    facing,
    isPlayerInLineOfSight,
    onFireMissile,
    readyToFire,
  ]);

  if (isEliminated && !hasMissileFired) {
    return null;
  }

  return (
    <Missile
      craftRotation={craftRotation}
      Icon={({style}) => (
        <EnemyMissileIcon
          fill={craftColor}
          height={missileSize}
          width={missileSize}
          style={{...style, left: 4}}
        />
      )}
      leftAnim={leftAnim}
      topAnim={topAnim}
      missileProps={missileProps}
    />
  );
};

export default EnemyMissile;
