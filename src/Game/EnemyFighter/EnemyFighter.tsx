import React, {useRef, useState} from 'react';
import {Animated} from 'react-native';

import Colors from 'types/colors';
import EnemyFighterIcon from 'icons/enemy-plane.svg';

import {Facing} from '../types';
import Craft, {CraftProps} from '../Craft';

interface EnemyFighterProps {
  defaultFacing?: CraftProps['facing'];
  startingTop?: number;
  startingLeft?: number;
}

const EnemyFighter = ({
  defaultFacing = 'S',
  startingTop = 0,
  startingLeft = 0,
}: EnemyFighterProps): JSX.Element => {
  const [facing, setFacing] = useState<Facing>(defaultFacing);
  const topAnim = useRef(new Animated.Value(startingTop)).current;
  const leftAnim = useRef(new Animated.Value(startingLeft)).current;

  return (
    <Craft
      Icon={({style, ...rest}) => (
        <EnemyFighterIcon
          style={{...style, transform: [{rotate: '-45deg'}]}}
          {...rest}
        />
      )}
      facing={facing}
      fill={Colors.RED}
      left={leftAnim}
      top={topAnim}
    />
  );
};

export default EnemyFighter;
