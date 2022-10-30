import React from 'react';

import EnemyUAVIcon from 'icons/enemy-alt.svg';
import {craftPixelsPerSecond} from 'Game/gameConstants';

import {EnemyCraftContextProvider} from './EnemyCraftContext';
import EnemyCraft from './EnemyCraft';

interface EnemyUAVProps {
  startingLeft?: number;
  startingTop?: number;
}

const EnemyUAV = (): JSX.Element => {
  return <EnemyCraft Icon={EnemyUAVIcon} />;
};

export default (props: EnemyUAVProps) => (
  <EnemyCraftContextProvider
    craftSpeedWhenLockedOn={craftPixelsPerSecond * 1.3}
    {...props}>
    <EnemyUAV />
  </EnemyCraftContextProvider>
);
