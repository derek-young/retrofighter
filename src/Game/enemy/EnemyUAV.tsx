import React from 'react';

import EnemyUAVIcon from 'icons/enemy-alt.svg';
import {craftPixelsPerSecond, Enemies, enemyPoints} from 'Game/constants';

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
  return <EnemyCraft Icon={EnemyUAVIcon} score={enemyPoints[Enemies.UAV]} />;
};

export default (props: EnemyUAVProps) => (
  <EnemyCraftContextProvider
    craftSpeedWhenLockedOn={craftPixelsPerSecond * 1.5}
    {...props}>
    <EnemyUAV />
  </EnemyCraftContextProvider>
);
