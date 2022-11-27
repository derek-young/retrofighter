import React from 'react';

import SpeederIcon from 'icons/enemy-speeder.svg';
import {craftPixelsPerSecond, Enemies, enemyPoints} from 'Game/constants';

import {EnemyCraftContextProvider} from './EnemyCraftContext';
import EnemyCraft from './EnemyCraft';

interface SpeederProps {
  isEliminated: boolean;
  onEliminationAnimationEnd: () => void;
  onIsEliminated: () => void;
  startingLeft?: number;
  startingTop?: number;
}

const Speeder = (): JSX.Element => {
  return <EnemyCraft Icon={SpeederIcon} score={enemyPoints[Enemies.SPEEDER]} />;
};

export default (props: SpeederProps) => (
  <EnemyCraftContextProvider
    defaultCraftSpeed={craftPixelsPerSecond * 1.5}
    craftSpeedWhenLockedOn={craftPixelsPerSecond * 3}
    {...props}>
    <Speeder />
  </EnemyCraftContextProvider>
);
