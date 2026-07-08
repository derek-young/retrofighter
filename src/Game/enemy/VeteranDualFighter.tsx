import React from 'react';

import DualFighterIcon from 'icons/dual-fighter.svg';
import Colors from 'types/colors';
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

const VeteranDualFighter = (): JSX.Element => {
  // Missile first so the craft paints on top of it.
  return (
    <>
      <EnemyMissile />
      <EnemyCraft
        craftColor={Colors.PURPLE}
        Icon={RotatedDualFighterIcon}
        score={enemyPoints[Enemies.VETERAN_DUAL_FIGHTER]}
      />
    </>
  );
};

export default React.memo((props: EnemyProps) => (
  <EnemyCraftContextProvider
    aiClass="veteran"
    defaultCraftSpeed={craftPixelsPerSecond}
    craftSpeedWhenLockedOn={craftPixelsPerSecond * 1.2}
    {...props}>
    <EnemyMissileProvider>
      <VeteranDualFighter />
    </EnemyMissileProvider>
  </EnemyCraftContextProvider>
));
