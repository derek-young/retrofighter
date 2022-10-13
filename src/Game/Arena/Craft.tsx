import React from 'react';
import {StyleSheet, View} from 'react-native';

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

enum Facing {
  N = 0,
  E = 90,
  S = 180,
  W = 270,
}

const SHADOW_POS = {
  [Facing.N]: {top: 4, left: 2},
  [Facing.E]: {top: -4, left: 2},
  [Facing.S]: {top: -4, left: -2},
  [Facing.W]: {top: 4, left: -2},
};

export type CraftProps = {
  Icon: React.ElementType;
  facing: keyof typeof Facing;
  fill: string;
  top: number;
  left: number;
};

const Craft = ({Icon, facing, fill, top, left}: CraftProps): JSX.Element => {
  const rotation = Facing[facing];
  const shadow = SHADOW_POS[rotation];

  return (
    <View
      style={{
        ...styles.iconContainer,
        top,
        left,
        transform: [{rotate: `${rotation}deg`}],
      }}>
      <Icon fill={fill} />
      <Icon fill="#00000040" style={{...styles.shadow, ...shadow}} />
    </View>
  );
};

export default Craft;
