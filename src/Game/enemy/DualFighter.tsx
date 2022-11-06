import React from 'react';

import DualFighterIcon from 'icons/enemy-plane.svg';

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
        Icon={({style, ...rest}) => (
          <DualFighterIcon
            style={{
              ...style,
              transform: [{rotate: '-45deg'}],
            }}
            {...rest}
          />
        )}
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
