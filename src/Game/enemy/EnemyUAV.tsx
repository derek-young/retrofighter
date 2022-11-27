import React from 'react';

import EnemyUAVIcon from 'icons/enemy-uav.svg';
import PumpkinPieIcon from 'icons/pumpkin-pie.svg';
import {craftPixelsPerSecond, Enemies, enemyPoints} from 'Game/constants';
import {getIsThanksgivingDay} from 'Game/utils';
import {IconProps} from 'Game/types';

import {EnemyCraftContextProvider} from './EnemyCraftContext';
import EnemyCraft from './EnemyCraft';

interface EnemyUAVProps {
  isEliminated: boolean;
  onEliminationAnimationEnd: () => void;
  onIsEliminated: () => void;
  startingLeft?: number;
  startingTop?: number;
}

const isThanksgivingDay = getIsThanksgivingDay();

const EnemyCraftIcon = isThanksgivingDay
  ? ({style, ...rest}: IconProps) => (
      <PumpkinPieIcon
        style={{...(style as object), transform: [{rotate: '90deg'}]}}
        {...rest}
      />
    )
  : EnemyUAVIcon;

const EnemyUAV = (): JSX.Element => {
  return <EnemyCraft Icon={EnemyCraftIcon} score={enemyPoints[Enemies.UAV]} />;
};

export default (props: EnemyUAVProps) => (
  <EnemyCraftContextProvider
    defaultCraftSpeed={craftPixelsPerSecond}
    craftSpeedWhenLockedOn={craftPixelsPerSecond * 1.6}
    {...props}>
    <EnemyUAV />
  </EnemyCraftContextProvider>
);
