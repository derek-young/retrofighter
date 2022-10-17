import React from 'react';

import BomberIcon from 'icons/enemy-alt.svg';

import EnemyCraft, {EnemyCraftProps} from './EnemyCraft';

interface BomberProps extends Omit<EnemyCraftProps, 'Icon'> {}

const Bomber = (props: BomberProps): JSX.Element => {
  return <EnemyCraft Icon={BomberIcon} {...props} />;
};

export default Bomber;
