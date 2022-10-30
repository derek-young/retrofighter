import React from 'react';

import DualFighterIcon from 'icons/enemy-plane.svg';

import EnemyCraft from './EnemyCraft';
import EnemyMissile from './EnemyMissile';

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

export default DualFighter;
