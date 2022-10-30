import React from 'react';

import EnemyUAVIcon from 'icons/enemy-alt.svg';

import EnemyCraft from './EnemyCraft';
import {EnemyCraftContextProviderProps} from './EnemyCraftContext';

interface EnemyUAVProps {
  startingLeft: EnemyCraftContextProviderProps['startingLeft'];
  startingTop: EnemyCraftContextProviderProps['startingTop'];
}

const EnemyUAV = (): JSX.Element => {
  return <EnemyCraft Icon={EnemyUAVIcon} />;
};

export default EnemyUAV;
