import React, {useEffect, useRef, useState} from 'react';
import {Animated, StyleSheet} from 'react-native';

import ExposionIcon from 'icons/supernova.svg';

import {craftSize} from './gameConstants';
import {Facing} from './types';

const styles = StyleSheet.create({
  iconContainer: {
    height: craftSize,
    width: craftSize,
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadow: {
    position: 'absolute',
    zIndex: -1,
  },
  elimination: {
    position: 'absolute',
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

function getNextRotationSet(facing: Facing) {
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
  isEliminated: boolean;
  facing: Facing;
  fill: string;
  onEliminationEnd: () => void;
  top: number | Animated.Value;
  left: number | Animated.Value;
};

const Craft = ({
  Icon,
  isEliminated,
  facing,
  fill,
  onEliminationEnd = () => {},
  top,
  left,
}: CraftProps): JSX.Element => {
  const rotation = DEFAULT_FACING_ROTATION[facing];
  const shadow = SHADOW_POS[facing];
  const rotationAnim = useRef(new Animated.Value(rotation)).current;
  const elimAnimation = useRef(new Animated.Value(0)).current;
  const [elimValue, setElimValue] = useState(0);
  const facingRef = useRef(facing);
  const [rotationState, setRotationState] = useState(0);

  const elimValueListener = ({value}: {value: number}) => setElimValue(value);

  const rotationValueListener = ({value}: {value: number}) =>
    setRotationState(Math.round(value));

  useEffect(() => {
    elimAnimation.addListener(elimValueListener);
    rotationAnim.addListener(rotationValueListener);
  }, [elimAnimation, rotationAnim]);

  useEffect(() => {
    if (isEliminated) {
      Animated.timing(elimAnimation, {
        toValue: 50,
        duration: 400,
        useNativeDriver: true,
      }).start(onEliminationEnd);
    }
  }, [elimAnimation, isEliminated, onEliminationEnd]);

  useEffect(() => {
    const nextRotation = getNextRotationSet(facingRef.current)[facing];

    facingRef.current = facing;

    Animated.timing(rotationAnim, {
      toValue: nextRotation,
      duration: 200,
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
      <ExposionIcon
        height={elimValue}
        width={elimValue}
        style={styles.elimination}
      />
    </Animated.View>
  );
};

export default Craft;
