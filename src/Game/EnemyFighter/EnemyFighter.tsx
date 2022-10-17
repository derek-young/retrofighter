import React, {useEffect, useRef, useState} from 'react';
import {Animated} from 'react-native';

import Colors from 'types/colors';
import EnemyFighterIcon from 'icons/enemy-plane.svg';
import Craft, {CraftProps} from 'Game/Craft';
import {animateCraft} from 'Game/utils';
import {Facing} from 'Game/types';

import {useEnemyContext} from './EnemyContext';

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
  const {playerLeft, playerTop} = useEnemyContext();
  const [facing, setFacing] = useState<Facing>(defaultFacing);
  const [hasInitialized, setHasInitialized] = useState(false);
  const topAnim = useRef(new Animated.Value(startingTop)).current;
  const leftAnim = useRef(new Animated.Value(startingLeft)).current;

  useEffect(() => {
    if (!hasInitialized && (playerLeft !== null || playerTop !== null)) {
      console.log('initializing');
      animateCraft({animation: topAnim, pixelsToMove: 200, toValue: 200});
      setHasInitialized(true);
    }
  }, [hasInitialized, playerLeft, playerTop, topAnim]);

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
