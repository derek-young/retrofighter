import React from 'react';
import {StyleSheet, View} from 'react-native';

const styles = StyleSheet.create({
  iconContainer: {
    height: 20,
    width: 20,
    // position: 'absolute',
    // top: 0,
    // left: 0,
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
};

const Craft = ({Icon, facing, fill}: CraftProps): JSX.Element => {
  const rotation = Facing[facing];
  const shadow = SHADOW_POS[rotation];

  return (
    <View
      style={{
        ...styles.iconContainer,
        transform: [{rotate: `${rotation}deg`}],
      }}>
      <Icon fill={fill} />
      <Icon fill="#00000040" style={{...styles.shadow, ...shadow}} />
    </View>
  );
};

export default Craft;
