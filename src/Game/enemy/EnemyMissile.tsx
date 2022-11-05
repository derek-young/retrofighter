import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Animated} from 'react-native';

import {DEFAULT_FACING_ROTATION} from 'Game/Craft';
import {MissileProps} from 'Game/types';
import {
  alleyWidth,
  missileDuration,
  missileSize,
  playerStartLeft,
  playerStartTop,
} from 'Game/constants';
import MissilePosition from 'Game/missilePositionFactory';
import Missile from 'Game/Missile';
import EnemyMissileIcon from 'icons/skull.svg';

import {useEnemyCraftContext} from './EnemyCraftContext';
import useMissileImpactDetector from './useMissileImpactDetector';
import {useAnimationContext} from 'Game/Fighter/AnimationContext';
import {useEliminationContext} from 'Game/Fighter/EliminationContext';

interface EnemyMissileProps {
  missileColor?: string;
}

const enemyMissileStartingTop = 12;
const leftOffset = 4;

const EnemyMissile = ({
  missileColor = '#FF0042',
}: EnemyMissileProps): null | JSX.Element => {
  const {
    hasPlayerMoved,
    leftAnim: playerLeftAnim,
    topAnim: playerTopAnim,
  } = useAnimationContext();
  const {isPlayerEliminated, onIsPlayerEliminated} = useEliminationContext();
  const {craftRotation, facing, isPlayerInLineOfSight, leftAnim, topAnim} =
    useEnemyCraftContext();
  const [hasMissileFired, setHasMissileFired] = useState(false);
  const missileAnim = useRef(
    new Animated.Value(enemyMissileStartingTop),
  ).current;
  const missilePosition = useRef(new MissilePosition()).current;

  const onFireAnimationEnded = useCallback(() => setHasMissileFired(false), []);
  const onFireMissile = useCallback(() => {
    if (!hasMissileFired) {
      setHasMissileFired(true);
      setTimeout(onFireAnimationEnded, missileDuration);
    }
  }, [hasMissileFired, onFireAnimationEnded]);

  const missileProps: MissileProps = {
    hasMissileFired,
    missileAnim,
    missilePosition,
    onFireAnimationEnded,
    onFireMissile,
    startingTop: enemyMissileStartingTop,
  };

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
      onFireMissile();
    }
  }, [
    craftRotation,
    facing,
    hasMissileFired,
    isPlayerInLineOfSight,
    onFireMissile,
  ]);

  useEffect(() => () => missileAnim.removeAllListeners(), [missileAnim]);

  return (
    <Missile
      craftRotation={craftRotation}
      facing={facing}
      Icon={({style}) => (
        <EnemyMissileIcon
          fill={missileColor}
          height={missileSize}
          width={missileSize}
          style={{...style, left: leftOffset}}
        />
      )}
      leftAnim={leftAnim}
      topAnim={topAnim}
      missileProps={missileProps}
      positionOffset={alleyWidth / 2}
    />
  );
};

export default EnemyMissile;
