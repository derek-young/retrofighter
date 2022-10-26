import React from 'react';

import {missileSize} from 'Game/gameConstants';
import Missile from 'Game/Missile';
import MissileIcon from 'icons/missile.svg';
import {MissileAnimationProps} from 'Game/types';

interface FighterMissileProps extends Omit<MissileAnimationProps, 'Icon'> {
  craftColor: string;
  iconStyle: Record<string, unknown>;
}

const FighterMissile = ({
  craftColor,
  iconStyle,
  ...rest
}: FighterMissileProps) => {
  return (
    <Missile
      Icon={({style}) => (
        <MissileIcon
          fill={craftColor}
          height={missileSize}
          width={missileSize}
          style={{...style, ...iconStyle}}
        />
      )}
      {...rest}
    />
  );
};

export default FighterMissile;
