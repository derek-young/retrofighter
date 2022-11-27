import React from 'react';

import EnemyCargoShipIcon from 'icons/enemy-cargo.svg';
import {craftPixelsPerSecond, Enemies, enemyPoints} from 'Game/constants';

import {EnemyCraftContextProvider} from './EnemyCraftContext';
import EnemyCraft from './EnemyCraft';

interface EnemyCargoShipProps {
  isEliminated: boolean;
  onEliminationAnimationEnd: () => void;
  onIsEliminated: () => void;
  startingLeft?: number;
  startingTop?: number;
}

const EnemyCargoShip = (): JSX.Element => {
  return (
    <EnemyCraft
      Icon={EnemyCargoShipIcon}
      score={enemyPoints[Enemies.CARGO_SHIP]}
    />
  );
};

export default (props: EnemyCargoShipProps) => (
  <EnemyCraftContextProvider
    defaultCraftSpeed={craftPixelsPerSecond * 0.6}
    {...props}>
    <EnemyCargoShip />
  </EnemyCraftContextProvider>
);
