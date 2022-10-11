import React from 'react';

import Colors from 'types/colors';
import EnemyFighterIcon from 'icons/enemy-plane.svg';

import Craft, {CraftProps} from './Craft';

type EnemyFighterProps = {
  facing: CraftProps['facing'];
};

const EnemyFighter = ({facing}: EnemyFighterProps): JSX.Element => {
  return (
    <Craft
      Icon={({style, ...rest}) => (
        <EnemyFighterIcon
          style={{...style, transform: [{rotate: '-45deg'}]}}
          {...rest}
        />
      )}
      facing={facing}
      fill={Colors.RED}
    />
  );
};

export default EnemyFighter;
