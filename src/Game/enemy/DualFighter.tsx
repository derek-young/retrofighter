import React from 'react';

import DualFighterIcon from 'icons/enemy-plane.svg';
import {Enemies, enemyPoints} from 'Game/constants';
import {IconProps} from 'Game/types';

import {EnemyCraftContextProvider} from './EnemyCraftContext';
import {EnemyMissileProvider} from './EnemyMissileContext';
import EnemyCraft from './EnemyCraft';
import EnemyMissile from './EnemyMissile';

interface DualFighterProps {
  isEliminated: boolean;
  onEliminationAnimationEnd: () => void;
  onIsEliminated: () => void;
  startingLeft?: number;
  startingTop?: number;
}

const DualFighter = (): JSX.Element => {
  return (
    <>
      <EnemyCraft
        Icon={({style, ...rest}: IconProps) => (
          <DualFighterIcon
            style={{...(style as object), transform: [{rotate: '-45deg'}]}}
            {...rest}
          />
        )}
        score={enemyPoints[Enemies.DUAL_FIGHTER]}
      />
      <EnemyMissile />
    </>
  );
};

export default (props: DualFighterProps) => (
  <EnemyCraftContextProvider {...props}>
    <EnemyMissileProvider>
      <DualFighter />
    </EnemyMissileProvider>
  </EnemyCraftContextProvider>
);
