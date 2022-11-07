import React, {useEffect, useRef, useState} from 'react';
import {Animated, StyleSheet} from 'react-native';

import ExposionIcon from 'icons/supernova.svg';

import {craftSize} from './constants';
import {Facing} from './types';
import {useGameContext} from './GameContext';

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
  score: {
    position: 'absolute',
    shadowColor: 'black',
    shadowOpacity: 0.4,
    left: -72,
    top: 16,
  },
});

export const DEFAULT_FACING_ROTATION: Record<Facing, number> = {
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
  ['N']: {top: 3, left: 2},
  ['E']: {top: -3, left: 2},
  ['S']: {top: -3, left: -2},
  ['W']: {top: 3, left: -2},
};

export type CraftProps = {
  Icon: React.ElementType;
  isEliminated: boolean;
  facing: Facing;
  fill: string;
  onEliminationEnd: () => void;
  top: number | Animated.Value;
  left: number | Animated.Value;
  rotationListener?: (props: {value: number}) => void;
  score: number;
};

const Craft = ({
  Icon,
  isEliminated,
  facing,
  fill,
  onEliminationEnd,
  left,
  top,
  rotationListener,
  score,
}: CraftProps): JSX.Element => {
  const {adjustScore} = useGameContext();
  const rotation = DEFAULT_FACING_ROTATION[facing];
  const shadow = SHADOW_POS[facing];
  const rotationAnim = useRef(new Animated.Value(rotation));
  const elimAnimation = useRef(new Animated.Value(0));
  const facingRef = useRef(facing);
  const onEliminationEndRef = useRef(onEliminationEnd);
  const rotationListenerRef = useRef(rotationListener);
  const [elimValue, setElimValue] = useState(0);
  const [hasEliminationEnded, setHasEliminationEnded] = useState(false);
  const [rotationState, setRotationState] = useState(0);

  rotationListenerRef.current = rotationListener;
  onEliminationEndRef.current = onEliminationEnd;

  const elimValueListener = ({value}: {value: number}) => setElimValue(value);

  const rotationValueListener = ({value}: {value: number}) =>
    setRotationState(Math.round(value));

  useEffect(() => {
    elimAnimation.current.addListener(elimValueListener);
    rotationAnim.current.addListener(rotationValueListener);

    if (rotationListenerRef.current) {
      rotationAnim.current.addListener(rotationListenerRef.current);
    }
  }, []);

  useEffect(() => {
    if (isEliminated) {
      adjustScore(score);

      Animated.timing(elimAnimation.current, {
        toValue: 50,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        onEliminationEndRef.current();
        elimAnimation.current.setValue(0);
        setHasEliminationEnded(true);
      });
    }
  }, [adjustScore, elimAnimation, isEliminated, score]);

  useEffect(() => {
    const nextRotation = getNextRotationSet(facingRef.current)[facing];

    facingRef.current = facing;

    Animated.timing(rotationAnim.current, {
      toValue: nextRotation,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      // Normalize values on animation finish
      if (nextRotation === -180) {
        rotationAnim.current.setValue(180);
      }
      if (nextRotation === 270) {
        rotationAnim.current.setValue(-90);
      }
    });
  }, [facing]);

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
      {hasEliminationEnded ? null : (
        <>
          <Icon fill={fill} />
          <Icon fill="#00000040" style={{...styles.shadow, ...shadow}} />
        </>
      )}
      <ExposionIcon
        height={elimValue}
        width={elimValue}
        style={styles.elimination}
      />
    </Animated.View>
  );
};

export default Craft;
