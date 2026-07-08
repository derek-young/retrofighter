import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Animated, Easing, StyleSheet} from 'react-native';

import {
  craftSize,
  maxScreenSize,
  missileSize,
  missileSpeed,
} from 'Game/constants';

import {DEFAULT_FACING_ROTATION} from './Craft';
import {Facing, MissileAnimationProps} from './types';
import {useGameContext} from './GameContext';
import {useSimulationContext} from './engine/SimulationContext';

const styles = StyleSheet.create({
  missile: {
    position: 'absolute',
  },
  missileContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: craftSize,
    width: craftSize,
    zIndex: -1,
  },
});

const rotationRange = {
  inputRange: [-360, 360],
  outputRange: ['-360deg', '360deg'],
};

type FiredState = {
  left: number;
  top: number;
  facing: Facing;
};

const Missile = ({
  rotationAnim,
  facing,
  Icon,
  leftAnim,
  topAnim,
  missileId,
  missileProps,
  ownerId,
  positionOffset = 0,
  targetKind,
}: MissileAnimationProps) => {
  const simulation = useSimulationContext();
  const {isPaused} = useGameContext();
  const {
    hasMissileFired,
    missileAnim,
    onFireAnimationEnded,
    startingTop = missileSize / 2,
  } = missileProps;
  const [firedState, setFiredState] = useState<null | FiredState>(null);
  const onFireAnimationEndedRef = useRef(onFireAnimationEnded);

  onFireAnimationEndedRef.current = onFireAnimationEnded;

  const dockedRotation = useMemo(
    () => rotationAnim.interpolate(rotationRange),
    [rotationAnim],
  );

  // Snapshots the launch position and registers the missile with the
  // simulation, which detects impacts. Runs before the animation effect
  // below so the sim entry exists when the visual starts.
  useEffect(() => {
    if (!hasMissileFired) {
      setFiredState(null);
      return;
    }

    const position = simulation.getPosition(ownerId);

    if (!position) {
      onFireAnimationEndedRef.current();
      return;
    }

    setFiredState({left: position.left, top: position.top, facing});
    simulation.addMissile(missileId, {
      originLeft: position.left,
      originTop: position.top,
      facing,
      positionOffset,
      startValue: startingTop,
      targetKind,
      onImpact: () => onFireAnimationEndedRef.current(),
    });

    return () => simulation.removeMissile(missileId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMissileFired]);

  useEffect(() => {
    if (!hasMissileFired) {
      missileAnim.stopAnimation();
      missileAnim.setValue(startingTop);
      return;
    }

    if (isPaused) {
      missileAnim.stopAnimation();
      return;
    }

    // Resumes from the simulation's authoritative travel value, so the
    // visual and the impact detection always agree.
    const value = simulation.getMissileValue(missileId) ?? startingTop;
    const duration = ((value + maxScreenSize) / missileSpeed) * 1000;

    missileAnim.setValue(value);
    Animated.timing(missileAnim, {
      toValue: -maxScreenSize,
      duration,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(({finished}) => {
      if (finished) {
        onFireAnimationEndedRef.current();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMissileFired, isPaused]);

  const containerTransform = firedState
    ? [
        {translateX: firedState.left},
        {translateY: firedState.top},
        {rotate: `${DEFAULT_FACING_ROTATION[firedState.facing]}deg`},
      ]
    : [
        {translateX: leftAnim},
        {translateY: topAnim},
        {rotate: dockedRotation},
      ];

  return (
    <Animated.View style={[styles.missileContainer, {transform: containerTransform}]}>
      <Animated.View
        style={[styles.missile, {transform: [{translateY: missileAnim}]}]}>
        <Icon style={styles.missile} />
      </Animated.View>
    </Animated.View>
  );
};

export default Missile;
