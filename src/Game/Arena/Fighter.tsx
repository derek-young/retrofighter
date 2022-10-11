import React from 'react';

import Colors from 'types/colors';
import FighterIcon from 'icons/spaceship.svg';

import Craft, {CraftProps} from './Craft';

type FighterProps = {
  facing: CraftProps['facing'];
};

const Fighter = ({facing}: FighterProps): JSX.Element => {
  return <Craft Icon={FighterIcon} facing={facing} fill={Colors.GREEN} />;
};

export default Fighter;
