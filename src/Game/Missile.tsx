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
  // No zIndex here: on iOS, mixing zIndex sorting with native-driver
  // transforms makes the view lose its transform. Missiles render behind
  // their craft by being mounted before it (paint order) instead.
  missileContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: craftSize,
    width: craftSize,
  },
  // Must span the container: the icon inside is absolutely positioned, so a
  // sized box is required for it to lay out (and render) against.
  missileTravel: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: craftSize,
    width: craftSize,
  },
});

const rotationRange = {
  inputRange: [-360, 360],
  outputRange: ['-360deg', '360deg'],
};

// Plain object (not a StyleSheet entry) so icon components can spread it
// into their own style objects.
const missileIconStyle = {position: 'absolute' as const};

type FiredState = {
  left: number;
  top: number;
  facing: Facing;
};

const Missile = ({
  rotationAnim,
  facing,
  Icon,
  isClusterBomb,
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
      isClusterBomb,
      ownerId,
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
      // Halt the in-flight timing. The frozen value is harmless: the docked
      // view uses a static offset, and the next launch re-seeds missileAnim
      // below before flight resumes.
      missileAnim.stopAnimation();
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

  // Docked and fired are separate keyed views so firing mounts a fresh native
  // view. Reusing the docked view for flight let the craft's still-running
  // native-driver rotation keep overriding the static launch transform,
  // sending the icon off with the craft's mid-turn heading while the
  // simulation missile flew the fire-time facing.
  //
  // Only the fired view reads the live travel value: missileAnim animates from
  // startValue toward -maxScreenSize during flight, and on impact
  // stopAnimation() freezes it at an on-screen value. The docked view therefore uses a static
  // startingTop offset, independent of missileAnim.
  return firedState ? (
    <Animated.View
      key="fired"
      style={[
        styles.missileContainer,
        {
          transform: [
            {translateX: firedState.left},
            {translateY: firedState.top},
            {rotate: `${DEFAULT_FACING_ROTATION[firedState.facing]}deg`},
          ],
        },
      ]}>
      <Animated.View
        style={[
          styles.missileTravel,
          {transform: [{translateY: missileAnim}]},
        ]}>
        <Icon style={missileIconStyle} />
      </Animated.View>
    </Animated.View>
  ) : (
    <Animated.View
      key="docked"
      style={[
        styles.missileContainer,
        {
          transform: [
            {translateX: leftAnim},
            {translateY: topAnim},
            {rotate: dockedRotation},
          ],
        },
      ]}>
      <Animated.View
        style={[styles.missileTravel, {transform: [{translateY: startingTop}]}]}>
        <Icon style={missileIconStyle} />
      </Animated.View>
    </Animated.View>
  );
};

export default Missile;
