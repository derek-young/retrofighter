import React from 'react';

import Colors from 'types/colors';
import EnemyFighterIcon from 'icons/enemy-plane.svg';

import Craft, {CraftProps} from './Craft';

interface EnemyFighterProps extends Omit<CraftProps, 'Icon' | 'fill'> {
  facing: CraftProps['facing'];
}

const EnemyFighter = (props: EnemyFighterProps): JSX.Element => {
  return (
    <Craft
      Icon={({style, ...rest}) => (
        <EnemyFighterIcon
          style={{...style, transform: [{rotate: '-45deg'}]}}
          {...rest}
        />
      )}
      fill={Colors.RED}
      {...props}
    />
  );
};

export default EnemyFighter;
