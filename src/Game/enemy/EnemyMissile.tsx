import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Animated} from 'react-native';

import Colors from 'types/colors';
import {DEFAULT_FACING_ROTATION} from 'Game/Craft';
import {missileSize} from 'Game/gameConstants';
import MissilePosition from 'Game/missilePositionFactory';
import Missile from 'Game/Missile';
import EnemyMissileIcon from 'icons/skull.svg';

import {useEnemyCraftContext} from './EnemyCraftContext';

const missilePosition = new MissilePosition();

interface EnemyMissileProps {
  craftColor?: string;
}

const EnemyMissile = ({craftColor = Colors.RED}: EnemyMissileProps) => {
  const {craftRotation, facing, isPlayerInLineOfSight, leftAnim, topAnim} =
    useEnemyCraftContext();
  const [hasMissileFired, setHasMissileFired] = useState(false);
  const [hasMissileImpacted, setHasMissileImpacted] = useState(false);
  const missileAnim = useRef(new Animated.Value(6)).current;

  const onFireMissile = useCallback(() => setHasMissileFired(true), []);
  const onMissileImpact = useCallback(() => setHasMissileImpacted(true), []);
  const resetMissileState = useCallback(() => {
    setHasMissileFired(false);
    setHasMissileImpacted(false);
  }, []);

  useEffect(() => {
    if (
      isPlayerInLineOfSight &&
      DEFAULT_FACING_ROTATION[facing] === craftRotation
    ) {
      onFireMissile();
    }
  }, [craftRotation, facing, isPlayerInLineOfSight, onFireMissile]);

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
      missileProps={{
        hasMissileFired,
        hasMissileImpacted,
        missileAnim,
        missilePosition,
        onFireMissile,
        onMissileImpact,
        resetMissileState,
        startingTop: 6,
      }}
    />
  );
};

export default EnemyMissile;
