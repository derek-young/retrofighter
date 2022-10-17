import React, {useEffect, useState} from 'react';
import {SvgProps} from 'react-native-svg';

import Colors from 'types/colors';
import Craft, {CraftProps} from 'Game/Craft';

import {useEnemyContext} from './EnemyContext';
import useEnemyCraftAnimation from './useEnemyCraftAnimation';

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
  const [hasInitialized, setHasInitialized] = useState(false);

  const {facing, initialize, leftAnim, topAnim} = useEnemyCraftAnimation({
    defaultFacing,
    startingLeft,
    startingTop,
  });

  useEffect(() => {
    if (!hasInitialized && (playerLeft !== null || playerTop !== null)) {
      initialize();
      setHasInitialized(true);
    }
  }, [hasInitialized, initialize, playerLeft, playerTop]);

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
