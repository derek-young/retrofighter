import React from 'react';
import {Animated, StyleSheet, View} from 'react-native';

import Colors from 'types/colors';
import {craftSize} from 'Game/constants';
import {Facing} from 'Game/types';
import {isVerticalFacing} from 'Game/utils';

const barThickness = 4;
const barLength = craftSize + 2;

const shieldOffset: Record<Facing, {x: number; y: number}> = {
  N: {x: 0, y: craftSize},
  S: {x: 0, y: -craftSize},
  E: {x: -craftSize, y: 0},
  W: {x: craftSize, y: 0},
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: craftSize,
    width: craftSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bar: {
    borderRadius: barThickness / 2,
    backgroundColor: Colors.SKY_BLUE,
    shadowColor: Colors.SKY_BLUE,
    shadowOpacity: 0.8,
    shadowOffset: {width: 0, height: 0},
  },
});

interface ShieldVisualProps {
  facing: Facing;
  left: number | Animated.Value;
  top: number | Animated.Value;
}

/**
 * The deployed shield: a glowing bar trailing one craft-size behind the
 * craft, matching the simulation's rear shield hitbox.
 */
const ShieldVisual = ({facing, left, top}: ShieldVisualProps) => {
  const offset = shieldOffset[facing];
  const barSize = isVerticalFacing(facing)
    ? {width: barLength, height: barThickness}
    : {width: barThickness, height: barLength};

  return (
    <Animated.View
      style={[
        styles.container,
        {
          // The rear offset is applied as layout (top/left), not inside the
          // transform: static values mixed into a native-driver transform are
          // baked in at mount and never updated when facing changes, which
          // would pin the shield to its initial (north) offset after a turn.
          left: offset.x,
          top: offset.y,
          transform: [{translateX: left}, {translateY: top}],
        },
      ]}>
      <View style={[styles.bar, barSize]} />
    </Animated.View>
  );
};

export default ShieldVisual;
