import React, {useEffect, useRef, useState} from 'react';
import {Animated} from 'react-native';
import {SvgProps} from 'react-native-svg';

import Colors from 'types/colors';
import Craft, {CraftProps} from 'Game/Craft';
import {animateCraft} from 'Game/utils';
import {Facing} from 'Game/types';

import {useEnemyContext} from './EnemyContext';

export interface EnemyCraftProps {
  defaultFacing?: CraftProps['facing'];
  Icon: React.FC<SvgProps>;
  startingTop?: number;
  startingLeft?: number;
}

const EnemyCraft = ({
  defaultFacing = 'S',
  Icon,
  startingTop = 0,
  startingLeft = 0,
}: EnemyCraftProps): JSX.Element => {
  const {playerLeft, playerTop} = useEnemyContext();
  const [facing, setFacing] = useState<Facing>(defaultFacing);
  const [hasInitialized, setHasInitialized] = useState(false);
  const topAnim = useRef(new Animated.Value(startingTop)).current;
  const leftAnim = useRef(new Animated.Value(startingLeft)).current;

  useEffect(() => {
    if (!hasInitialized && (playerLeft !== null || playerTop !== null)) {
      animateCraft({animation: topAnim, pixelsToMove: 200, toValue: 200});
      setHasInitialized(true);
    }
  }, [hasInitialized, playerLeft, playerTop, topAnim]);

  return (
    <Craft
      Icon={Icon}
      facing={facing}
      fill={Colors.RED}
      left={leftAnim}
      top={topAnim}
    />
  );
};

export default EnemyCraft;
