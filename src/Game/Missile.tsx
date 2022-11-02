import React, {useEffect, useRef, useState} from 'react';
import {Animated, Easing, StyleSheet} from 'react-native';

import {
  craftSize,
  maxScreenSize,
  missileDuration,
  missileSize,
} from 'Game/gameConstants';

import {MissileAnimationProps, MissileIconProps} from './types';

const styles = StyleSheet.create({
  missile: {
    position: 'absolute',
  },
  missileContainer: {
    position: 'absolute',
    height: craftSize,
    width: craftSize,
  },
});

const MissileIcon = ({
  hasMissileFired,
  hasMissileImpacted,
  Icon,
  missileAnim,
  startingTop = missileSize / 2,
}: MissileIconProps) => {
  const [hasFireAnimationEnded, setHasFireAnimationEnded] = useState(false);
  const [missileTop, setMissileTop] = useState(startingTop);

  useEffect(() => {
    missileAnim.addListener(({value}: {value: number}) => setMissileTop(value));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (hasMissileFired) {
      Animated.timing(missileAnim, {
        duration: missileDuration,
        easing: Easing.linear,
        toValue: maxScreenSize * -1,
        useNativeDriver: true,
      }).start(() => setHasFireAnimationEnded(true));
    } else {
      missileAnim.setValue(startingTop);
      setHasFireAnimationEnded(false);
    }
  }, [hasMissileFired, missileAnim, startingTop]);

  useEffect(() => {
    if (hasMissileImpacted) {
      missileAnim.setValue(startingTop);
    }
  }, [hasMissileImpacted, missileAnim, startingTop]);

  if (hasFireAnimationEnded) {
    return null;
  }

  return <Icon style={{...styles.missile, top: missileTop}} />;
};

const Missile = ({
  craftRotation,
  Icon,
  leftAnim,
  topAnim,
  leftOffset = 0,
  topOffset = 0,
  missileProps,
}: MissileAnimationProps) => {
  const [leftValue, setLeftValue] = useState(null);
  const [topValue, setTopValue] = useState(null);
  const craftRotationRef = useRef<null | number>(null);
  const leftValueRef = useRef(leftOffset);
  const topValueRef = useRef(topOffset);
  const left = leftValue ?? leftAnim;
  const top = topValue ?? topAnim;

  leftValueRef.current = leftValue ?? 0;
  topValueRef.current = topValue ?? 0;

  useEffect(() => {
    if (missileProps.hasMissileFired) {
      craftRotationRef.current = craftRotation;
      // @ts-ignore
      setLeftValue(leftAnim._value);
      // @ts-ignore
      setTopValue(topAnim._value);
    } else {
      craftRotationRef.current = null;
      setLeftValue(null);
      setTopValue(null);
    }
  }, [missileProps.hasMissileFired]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (missileProps.hasMissileImpacted) {
      craftRotationRef.current = null;
      setLeftValue(null);
      setTopValue(null);
    }
  }, [missileProps.hasMissileImpacted]);

  useEffect(() => {
    missileProps.missileAnim.addListener(({value}: {value: number}) => {
      const listeners = missileProps.missilePosition.getListeners();

      listeners.forEach(listener => {
        let missileLeft = leftValueRef.current + leftOffset;
        let missileTop = topValueRef.current + topOffset;

        switch (craftRotationRef.current) {
          case 0:
            missileTop = topValueRef.current + value;
            break;
          case 90:
            missileLeft = leftValueRef.current - value;
            break;
          case 180:
            missileTop = topValueRef.current - value;
            break;
          case -90:
            missileLeft = leftValueRef.current + value;
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
        transform: [
          {rotate: `${craftRotationRef.current ?? craftRotation}deg`},
        ],
      }}>
      <MissileIcon Icon={Icon} {...missileProps} />
    </Animated.View>
  );
};

export default Missile;
