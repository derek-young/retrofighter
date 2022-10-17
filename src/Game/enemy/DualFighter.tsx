import React from 'react';

import DualFighterIcon from 'icons/enemy-plane.svg';

import EnemyCraft, {EnemyCraftProps} from './EnemyCraft';
import {StyleProp, ViewStyle} from 'react-native';

interface DualFighterProps extends Omit<EnemyCraftProps, 'Icon'> {}

type StyleType = StyleProp<ViewStyle>;

const DualFighter = (props: DualFighterProps): JSX.Element => {
  return (
    <EnemyCraft
      Icon={({style, ...rest}) => (
        <DualFighterIcon
          style={{
            ...style,
            transform: [{rotate: '-45deg'}],
          }}
          {...rest}
        />
      )}
      {...props}
    />
  );
};

export default DualFighter;
