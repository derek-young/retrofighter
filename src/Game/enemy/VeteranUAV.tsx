import React from 'react';

import EnemyUAVIcon from 'icons/enemy-uav.svg';
import Colors from 'types/colors';
import {craftPixelsPerSecond, Enemies, enemyPoints} from 'Game/constants';

import {EnemyCraftContextProvider} from './EnemyCraftContext';
import EnemyCraft from './EnemyCraft';
import {EnemyProps} from './enemyProps';

const VeteranUAV = (): JSX.Element => {
  return (
    <EnemyCraft
      craftColor={Colors.PURPLE}
      Icon={EnemyUAVIcon}
      score={enemyPoints[Enemies.VETERAN_UAV]}
    />
  );
};

export default React.memo((props: EnemyProps) => (
  <EnemyCraftContextProvider
    aiClass="veteran"
    defaultCraftSpeed={craftPixelsPerSecond}
    craftSpeedWhenLockedOn={craftPixelsPerSecond * 1.6}
    {...props}>
    <VeteranUAV />
  </EnemyCraftContextProvider>
));
