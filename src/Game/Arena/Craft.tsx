import React from 'react';
import {Animated, StyleSheet} from 'react-native';

import {craftSize} from '../gameConstants';
import {Facing} from '../types';

const styles = StyleSheet.create({
  iconContainer: {
    height: craftSize,
    width: craftSize,
    position: 'absolute',
  },
  shadow: {
    position: 'absolute',
    zIndex: -1,
  },
});

const FACING_ROTATION: Record<Facing, number> = {
  ['N']: 0,
  ['E']: 90,
  ['S']: 180,
  ['W']: 270,
};

const SHADOW_POS = {
  [FACING_ROTATION.N]: {top: 4, left: 2},
  [FACING_ROTATION.E]: {top: -4, left: 2},
  [FACING_ROTATION.S]: {top: -4, left: -2},
  [FACING_ROTATION.W]: {top: 4, left: -2},
};

export type CraftProps = {
  Icon: React.ElementType;
  facing: Facing;
  fill: string;
  top: number | Animated.Value;
  left: number | Animated.Value;
};

const Craft = ({Icon, facing, fill, top, left}: CraftProps): JSX.Element => {
  const rotation = FACING_ROTATION[facing];
  const shadow = SHADOW_POS[rotation];

  return (
    <Animated.View
      style={[
        {
          ...styles.iconContainer,
          transform: [{rotate: `${rotation}deg`}],
          top,
          left,
        },
      ]}>
      <Icon fill={fill} />
      <Icon fill="#00000040" style={{...styles.shadow, ...shadow}} />
    </Animated.View>
  );
};

export default Craft;
