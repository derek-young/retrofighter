import React, {useEffect} from 'react';

import Colors from 'types/colors';
import ClusterBombIcon from 'icons/cluster-bomb.svg';
import Missile from 'Game/Missile';
import {alleyWidth, missileSize} from 'Game/constants';
import {DEFAULT_FACING_ROTATION} from 'Game/Craft';
import {IconProps, MissileProps} from 'Game/types';
import {useItemFactoryContext} from 'Game/items/ItemFactoryContext';

import {useEnemyCraftContext} from './EnemyCraftContext';

const leftOffset = 4;

function StyledClusterBombIcon({style}: IconProps) {
  return (
    <ClusterBombIcon
      fill={Colors.PINK}
      height={missileSize}
      width={missileSize}
      style={{...(style as object), left: leftOffset}}
    />
  );
}

interface EnemyClusterBombMissileProps {
  missileProps: MissileProps;
}

/**
 * A picked-up cluster bomb docked on an enemy craft. Any enemy can carry and
 * fire one — including types with no missiles of their own — using the same
 * fire rule as regular enemy missiles: shortly after the player is spotted,
 * once the craft has visually finished rotating toward its travel direction.
 */
const EnemyClusterBombMissile = ({
  missileProps,
}: EnemyClusterBombMissileProps): null | JSX.Element => {
  const {
    craftRotation,
    facing,
    isEliminated,
    isPlayerInLineOfSight,
    leftAnim,
    rotationAnim,
    simId,
    topAnim,
  } = useEnemyCraftContext();
  const {effects} = useItemFactoryContext();
  const {hasMissileFired, onFireMissile} = missileProps;
  const hasClusterBomb = Boolean(effects[simId]?.hasClusterBomb);

  useEffect(() => {
    if (
      hasClusterBomb &&
      !hasMissileFired &&
      !isEliminated &&
      isPlayerInLineOfSight &&
      DEFAULT_FACING_ROTATION[facing] === craftRotation
    ) {
      const timeoutId = setTimeout(onFireMissile, 400);

      return () => clearTimeout(timeoutId);
    }
  }, [
    craftRotation,
    facing,
    hasClusterBomb,
    hasMissileFired,
    isEliminated,
    isPlayerInLineOfSight,
    onFireMissile,
  ]);

  if (!(hasClusterBomb && !isEliminated) && !hasMissileFired) {
    return null;
  }

  return (
    <Missile
      facing={facing}
      Icon={StyledClusterBombIcon}
      isClusterBomb
      leftAnim={leftAnim}
      topAnim={topAnim}
      missileId={`${simId}-cluster-missile`}
      missileProps={missileProps}
      ownerId={simId}
      positionOffset={alleyWidth / 2}
      rotationAnim={rotationAnim}
      targetKind="player"
    />
  );
};

export default EnemyClusterBombMissile;
