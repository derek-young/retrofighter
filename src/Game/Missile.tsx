import React, {useEffect, useRef, useState} from 'react';
import {Animated, Easing, StyleSheet} from 'react-native';

import {
  alleyWidth,
  craftSize,
  maxScreenSize,
  missileDuration,
  missileSize,
} from 'Game/constants';

import {DEFAULT_FACING_ROTATION} from './Craft';
import {Facing, MissileAnimationProps, MissileIconProps} from './types';
import {useGameContext} from './GameContext';

const styles = StyleSheet.create({
  missile: {
    position: 'absolute',
  },
  missileContainer: {
    position: 'absolute',
    height: craftSize,
    width: craftSize,
    zIndex: -1,
  },
});

type AnimationCallback = (callbackProps: {finished: boolean}) => void;

interface AnimateMissileProps {
  callback: AnimationCallback;
  missileAnim: Animated.Value;
}

function animateMissile({callback, missileAnim}: AnimateMissileProps) {
  Animated.timing(missileAnim, {
    duration: missileDuration,
    easing: Easing.linear,
    toValue: maxScreenSize * -1,
    useNativeDriver: true,
  }).start(callback);
}

const MissileIcon = ({
  hasMissileFired,
  Icon,
  missileAnim,
  onFireAnimationEnded,
  startingTop = missileSize / 2,
}: MissileIconProps) => {
  const {isPaused} = useGameContext();
  const [missileTop, setMissileTop] = useState(startingTop);
  const missileAnimCallbackRef = useRef<AnimationCallback>(({finished}) => {
    if (finished) {
      onFireAnimationEnded();
    }
  });

  useEffect(() => {
    missileAnim.addListener(({value}: {value: number}) => setMissileTop(value));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isPaused) {
      missileAnim.stopAnimation();
    } else if (!isPaused && hasMissileFired) {
      animateMissile({
        callback: missileAnimCallbackRef.current,
        missileAnim,
      });
    }
  }, [hasMissileFired, isPaused, missileAnim]);

  useEffect(() => {
    if (hasMissileFired) {
      animateMissile({
        callback: missileAnimCallbackRef.current,
        missileAnim,
      });
    } else {
      missileAnim.setValue(startingTop);
    }
  }, [hasMissileFired, missileAnim, startingTop]);

  return <Icon style={{...styles.missile, top: missileTop}} />;
};

const Missile = ({
  craftRotation,
  facing,
  Icon,
  leftAnim,
  topAnim,
  missileProps,
  positionOffset = 0,
}: MissileAnimationProps) => {
  const [leftValue, setLeftValue] = useState(null);
  const [topValue, setTopValue] = useState(null);
  const facingRef = useRef<null | Facing>(null);
  const leftValueRef = useRef(0);
  const topValueRef = useRef(0);
  const left = leftValue ?? leftAnim;
  const top = topValue ?? topAnim;
  const rotation =
    facingRef.current !== null
      ? DEFAULT_FACING_ROTATION[facingRef.current]
      : craftRotation;

  leftValueRef.current = leftValue ?? 0;
  topValueRef.current = topValue ?? 0;

  useEffect(() => {
    if (missileProps.hasMissileFired) {
      facingRef.current = facing;
      // @ts-ignore
      setLeftValue(leftAnim._value);
      // @ts-ignore
      setTopValue(topAnim._value);
    } else {
      facingRef.current = null;
      setLeftValue(null);
      setTopValue(null);
    }
  }, [missileProps.hasMissileFired]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!missileProps.hasMissileFired) {
      facingRef.current = null;
      setLeftValue(null);
      setTopValue(null);
    }
  }, [missileProps.hasMissileFired]);

  useEffect(() => {
    missileProps.missileAnim.addListener(({value}: {value: number}) => {
      const listeners = missileProps.missilePosition.getListeners();

      listeners.forEach(listener => {
        let missileLeft = leftValueRef.current;
        let missileTop = topValueRef.current;

        switch (facingRef.current) {
          case 'N':
            missileLeft += positionOffset;
            missileTop += value;
            break;
          case 'E':
            missileLeft -= value;
            missileTop += positionOffset;
            break;
          case 'S':
            missileLeft += alleyWidth - positionOffset;
            missileTop -= value;
            break;
          case 'W':
            missileLeft += value;
            missileTop += alleyWidth - positionOffset;
            break;
        }

        listener({left: missileLeft, top: missileTop});
      });
    });

    return () => missileProps.missileAnim.removeAllListeners();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Animated.View
      style={{
        ...styles.missileContainer,
        left,
        top,
        transform: [{rotate: `${rotation}deg`}],
      }}>
      <MissileIcon Icon={Icon} {...missileProps} />
    </Animated.View>
  );
};

export default Missile;
