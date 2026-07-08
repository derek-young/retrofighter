import React from 'react';

import DualFighterIcon from 'icons/dual-fighter.svg';
import {craftPixelsPerSecond, Enemies, enemyPoints} from 'Game/constants';
import {IconProps} from 'Game/types';

import {EnemyCraftContextProvider} from './EnemyCraftContext';
import {EnemyMissileProvider} from './EnemyMissileContext';
import EnemyCraft from './EnemyCraft';
import EnemyMissile from './EnemyMissile';
import {EnemyProps} from './enemyProps';

function RotatedDualFighterIcon({style, ...rest}: IconProps) {
  return (
    <DualFighterIcon
      style={{...(style as object), transform: [{rotate: '-45deg'}]}}
      {...rest}
    />
  );
}

const DualFighter = (): JSX.Element => {
  return (
    <>
      <EnemyCraft
        Icon={RotatedDualFighterIcon}
        score={enemyPoints[Enemies.DUAL_FIGHTER]}
      />
      <EnemyMissile />
    </>
  );
};

export default React.memo((props: EnemyProps) => (
  <EnemyCraftContextProvider
    defaultCraftSpeed={craftPixelsPerSecond}
    {...props}>
    <EnemyMissileProvider>
      <DualFighter />
    </EnemyMissileProvider>
  </EnemyCraftContextProvider>
));
