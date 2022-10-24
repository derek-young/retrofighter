import React from 'react';

import Colors from 'types/colors';
import {missileSize} from 'Game/gameConstants';
import Missile from 'Game/Missile';
import MissileIcon from 'icons/missile.svg';
import {MissileAnimationProps} from 'Game/types';

interface FighterMissileProps extends Omit<MissileAnimationProps, 'Icon'> {
  iconStyle: Record<string, unknown>;
}

const FighterMissile = ({iconStyle, ...rest}: FighterMissileProps) => {
  return (
    <Missile
      Icon={({style}) => (
        <MissileIcon
          fill={Colors.GREEN}
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
