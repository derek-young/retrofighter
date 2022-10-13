import React from 'react';

import Colors from 'types/colors';
import FighterIcon from 'icons/spaceship.svg';

import Craft, {CraftProps} from './Craft';

interface FighterProps extends Omit<CraftProps, 'Icon' | 'fill'> {
  facing: CraftProps['facing'];
}

const Fighter = (props: FighterProps): JSX.Element => {
  return <Craft Icon={FighterIcon} fill={Colors.GREEN} {...props} />;
};

export default Fighter;
