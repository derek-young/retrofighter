import React from 'react';
import {Animated, StyleSheet} from 'react-native';

export const CRAFT_SIZE = 20;

const styles = StyleSheet.create({
  iconContainer: {
    height: CRAFT_SIZE,
    width: CRAFT_SIZE,
    position: 'absolute',
  },
  shadow: {
    position: 'absolute',
    zIndex: -1,
  },
});

enum FacingRotation {
  N = 0,
  E = 90,
  S = 180,
  W = 270,
}

export type Facing = keyof typeof FacingRotation;

const SHADOW_POS = {
  [FacingRotation.N]: {top: 4, left: 2},
  [FacingRotation.E]: {top: -4, left: 2},
  [FacingRotation.S]: {top: -4, left: -2},
  [FacingRotation.W]: {top: 4, left: -2},
};

export type CraftProps = {
  Icon: React.ElementType;
  facing: Facing;
  fill: string;
  top: number | Animated.Value;
  left: number | Animated.Value;
};

const Craft = ({Icon, facing, fill, top, left}: CraftProps): JSX.Element => {
  const rotation = FacingRotation[facing];
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
