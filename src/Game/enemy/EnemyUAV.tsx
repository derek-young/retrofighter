import React from 'react';

import EnemyUAVIcon from 'icons/enemy-alt.svg';

import EnemyCraft, {EnemyCraftProps} from './EnemyCraft';

interface EnemyUAVProps extends Omit<EnemyCraftProps, 'Icon'> {}

const EnemyUAV = (props: EnemyUAVProps): JSX.Element => {
  return <EnemyCraft Icon={EnemyUAVIcon} {...props} />;
};

export default EnemyUAV;
