import React from 'react';
import {alleyWidth, missileSize} from 'Game/constants';
import {getIsThanksgivingDay} from 'Game/utils';
import Missile from 'Game/Missile';
import {IconProps} from 'Game/types';
import EnemyMissileIcon from 'icons/enemy-missile.svg';
import TurkyLegIcon from 'icons/turkey-leg.svg';

import {useEnemyCraftContext} from './EnemyCraftContext';
import {useEnemyMissileContext} from './EnemyMissileContext';

interface EnemyMissileProps {
  missileColor?: string;
}

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

const EnemyMissile = ({
  missileColor = '#FF0042',
}: EnemyMissileProps): null | JSX.Element => {
  const {craftRotation, facing, leftAnim, topAnim} = useEnemyCraftContext();
  const missileProps = useEnemyMissileContext();

  return (
    <Missile
      craftRotation={craftRotation}
      facing={facing}
      Icon={({style}) => (
        <MissileIcon
          fill={missileColor}
          height={missileSize}
          width={missileSize}
          style={{...(style as object), left: leftOffset}}
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
