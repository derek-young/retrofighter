import React from 'react';

import Colors from 'types/colors';
import Missile, {MissileProps} from 'Game/Missile';
import MissileIcon from 'icons/missile.svg';

interface FighterMissileProps extends Omit<MissileProps, 'fill' | 'Icon'> {}

const FighterMissile = (props: FighterMissileProps) => {
  return <Missile fill={Colors.GREEN} Icon={MissileIcon} {...props} />;
};

export default FighterMissile;
