import React from 'react';

import Colors from 'types/colors';
import FighterIcon from 'icons/spaceship.svg';

import Craft from '../Craft';
import {useFighterContext} from './FigherContext';

const Fighter = (): JSX.Element => {
  const {facing, leftAnim, topAnim} = useFighterContext();

  return (
    <Craft
      Icon={FighterIcon}
      fill={Colors.GREEN}
      facing={facing}
      left={leftAnim}
      top={topAnim}
    />
  );
};

export default Fighter;
