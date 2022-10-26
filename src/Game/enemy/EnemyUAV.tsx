import React from 'react';

import EnemyUAVIcon from 'icons/enemy-alt.svg';
import {craftPixelsPerSecond} from 'Game/gameConstants';

import EnemyCraft, {EnemyCraftProps} from './EnemyCraft';

interface EnemyUAVProps
  extends Omit<EnemyCraftProps, 'craftSpeedWhenLockedOn' | 'Icon'> {}

const EnemyUAV = (props: EnemyUAVProps): JSX.Element => {
  return (
    <EnemyCraft
      craftSpeedWhenLockedOn={craftPixelsPerSecond * 1.3}
      Icon={EnemyUAVIcon}
      {...props}
    />
  );
};

export default EnemyUAV;
