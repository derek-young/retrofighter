import React from 'react';

import Colors from 'types/colors';
import {missileSize} from 'Game/gameConstants';
import Missile, {MissileProps} from 'Game/Missile';
import MissileIcon from 'icons/missile.svg';

interface FighterMissileProps extends Omit<MissileProps, 'Icon'> {
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
