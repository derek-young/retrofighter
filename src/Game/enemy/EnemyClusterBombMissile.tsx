import React, {useEffect, useMemo} from 'react';

import Colors from 'types/colors';
import ClusterBombIcon from 'icons/cluster-bomb.svg';
import Missile from 'Game/Missile';
import {alleyWidth, missileSize} from 'Game/constants';
import {DEFAULT_FACING_ROTATION} from 'Game/Craft';
import {IconProps} from 'Game/types';
import {useItemFactoryContext} from 'Game/items/ItemFactoryContext';

import {useEnemyCraftContext} from './EnemyCraftContext';
import {useEnemyMissileContext} from './EnemyMissileContext';

const leftOffset = 4;

/**
 * A picked-up cluster bomb docked on an enemy craft. Any enemy can carry and
 * fire one — including types with no missiles of their own — using the same
 * fire rule as regular enemy missiles: shortly after the player is spotted,
 * once the craft has visually finished rotating toward its travel direction.
 */
const EnemyClusterBombMissile = (): null | JSX.Element => {
  const {
    clusterMissileProps,
    craftRotation,
    facing,
    isEliminated,
    isPlayerInLineOfSight,
    leftAnim,
    rotationAnim,
    simId,
    topAnim,
  } = useEnemyCraftContext();
  const regularMissileProps = useEnemyMissileContext();
  const {effects} = useItemFactoryContext();
  const {hasMissileFired, onFireMissile} = clusterMissileProps;
  const craftEffects = effects[simId];
  const hasClusterBomb = (craftEffects?.clusterBombCount ?? 0) > 0;
  // A cloaked enemy's missile fades with it, so the player can't track the
  // craft by its ordnance.
  const fill = craftEffects?.isCloaked ? `${Colors.ORANGE}26` : Colors.ORANGE;

  const Icon = useMemo(
    () =>
      // eslint-disable-next-line react/no-unstable-nested-components
      function StyledClusterBombIcon({style}: IconProps) {
        return (
          <ClusterBombIcon
            fill={fill}
            height={missileSize}
            width={missileSize}
            style={{...(style as object), left: leftOffset}}
          />
        );
      },
    [fill],
  );

  // Fire one missile at a time: never launch while this craft's regular
  // missile is mid-flight (dual fighters), mirroring the regular missile's
  // own guard against firing while a bomb is in flight.
  useEffect(() => {
    if (
      hasClusterBomb &&
      !hasMissileFired &&
      !isEliminated &&
      !regularMissileProps.hasMissileFired &&
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
    regularMissileProps.hasMissileFired,
  ]);

  if (!(hasClusterBomb && !isEliminated) && !hasMissileFired) {
    return null;
  }

  return (
    <Missile
      facing={facing}
      Icon={Icon}
      isClusterBomb
      leftAnim={leftAnim}
      topAnim={topAnim}
      missileId={`${simId}-cluster-missile`}
      missileProps={clusterMissileProps}
      ownerId={simId}
      positionOffset={alleyWidth / 2}
      rotationAnim={rotationAnim}
      targetKind="player"
    />
  );
};

export default EnemyClusterBombMissile;
