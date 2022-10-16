import React, {useEffect, useRef, useState} from 'react';
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

const DEFAULT_FACING_ROTATION: Record<Facing, number> = {
  ['N']: 0,
  ['E']: 90,
  ['S']: 180,
  ['W']: -90,
};

const sFacingRotation = {
  ...DEFAULT_FACING_ROTATION,
  ['W']: 270,
};

const wFacingRotation = {
  ...DEFAULT_FACING_ROTATION,
  ['S']: -180,
};

function getRotationSet(facing: Facing) {
  switch (facing) {
    case 'N':
      return DEFAULT_FACING_ROTATION;
    case 'E':
      return DEFAULT_FACING_ROTATION;
    case 'S':
      return sFacingRotation;
    case 'W':
      return wFacingRotation;
    default:
      return DEFAULT_FACING_ROTATION;
  }
}

const SHADOW_POS = {
  ['N']: {top: 4, left: 2},
  ['E']: {top: -4, left: 2},
  ['S']: {top: -4, left: -2},
  ['W']: {top: 4, left: -2},
};

export type CraftProps = {
  Icon: React.ElementType;
  facing: Facing;
  fill: string;
  top: number | Animated.Value;
  left: number | Animated.Value;
};

const Craft = ({Icon, facing, fill, top, left}: CraftProps): JSX.Element => {
  const rotation = DEFAULT_FACING_ROTATION[facing];
  const shadow = SHADOW_POS[facing];
  const rotationAnim = useRef(new Animated.Value(rotation)).current;
  const facingRef = useRef(facing);
  const [rotationState, setRotationState] = useState(0);

  const rotationValueListener = ({value}: {value: number}) =>
    setRotationState(Math.round(value));

  useEffect(() => {
    rotationAnim.addListener(rotationValueListener);
  }, [rotationAnim]);

  useEffect(() => {
    const nextRotation = getRotationSet(facingRef.current)[facing];

    facingRef.current = facing;

    Animated.timing(rotationAnim, {
      toValue: nextRotation,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // Normalize values on animation finish
      if (nextRotation === -180) {
        rotationAnim.setValue(180);
      }
      if (nextRotation === 270) {
        rotationAnim.setValue(-90);
      }
    });
  }, [facing, rotationAnim]);

  return (
    <Animated.View
      style={[
        {
          ...styles.iconContainer,
          transform: [{rotate: `${rotationState}deg`}],
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
