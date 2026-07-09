import React, {useMemo} from 'react';
import {alleyWidth, missileSize} from 'Game/constants';
import {getIsThanksgivingDay} from 'Game/utils';
import Missile from 'Game/Missile';
import {IconProps} from 'Game/types';
import {useItemFactoryContext} from 'Game/items/ItemFactoryContext';
import EnemyMissileIcon from 'icons/enemy-missile.svg';
import TurkyLegIcon from 'icons/turkey-leg.svg';

import {useEnemyCraftContext} from './EnemyCraftContext';
import {useEnemyMissileContext} from './EnemyMissileContext';

const missileColor = '#FF0042';
const leftOffset = 4;

const isThanksgivingDay = getIsThanksgivingDay();

const MissileIcon: React.FC<IconProps> = isThanksgivingDay
  ? ({style, ...rest}: IconProps) => (
      <TurkyLegIcon
        style={{...(style as object), transform: [{rotate: '-45deg'}]}}
        {...rest}
      />
    )
  : EnemyMissileIcon;

const EnemyMissile = (): null | JSX.Element => {
  const {facing, leftAnim, rotationAnim, simId, topAnim} =
    useEnemyCraftContext();
  const missileProps = useEnemyMissileContext();
  const {effects} = useItemFactoryContext();
  // A cloaked enemy's missile fades with it, so the player can't track the
  // craft by its ordnance.
  const fill = effects[simId]?.isCloaked ? `${missileColor}26` : missileColor;

  const Icon = useMemo(
    () =>
      // eslint-disable-next-line react/no-unstable-nested-components
      function StyledMissileIcon({style}: IconProps) {
        return (
          <MissileIcon
            fill={fill}
            height={missileSize}
            width={missileSize}
            style={{...(style as object), left: leftOffset}}
          />
        );
      },
    [fill],
  );

  return (
    <Missile
      facing={facing}
      Icon={Icon}
      leftAnim={leftAnim}
      topAnim={topAnim}
      missileId={`${simId}-missile`}
      missileProps={missileProps}
      ownerId={simId}
      positionOffset={alleyWidth / 2}
      rotationAnim={rotationAnim}
      targetKind="player"
    />
  );
};

export default EnemyMissile;
