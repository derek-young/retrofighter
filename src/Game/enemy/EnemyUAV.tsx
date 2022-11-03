import React from 'react';

import EnemyUAVIcon from 'icons/enemy-alt.svg';
import {craftPixelsPerSecond} from 'Game/constants';

import {EnemyCraftContextProvider} from './EnemyCraftContext';
import EnemyCraft from './EnemyCraft';

interface EnemyUAVProps {
  isEliminated: boolean;
  onEliminationAnimationEnd: () => void;
  onIsEliminated: () => void;
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
