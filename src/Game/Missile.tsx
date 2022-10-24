import React, {useEffect, useRef, useState} from 'react';
import {Animated, Easing, StyleSheet} from 'react-native';

import {
  craftSize,
  maxScreenSize,
  missileSize,
  missileSpeed,
} from 'Game/gameConstants';

import {MissileAnimationProps, MissileIconProps} from './types';

const styles = StyleSheet.create({
  missile: {
    position: 'absolute',
    transform: [{rotate: '-45deg'}],
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
}: MissileIconProps) => {
  const [hasFireAnimationEnded, setHasFireAnimationEnded] = useState(false);
  const [missileTop, setMissileTop] = useState(missileSize / 2);

  useEffect(() => {
    missileAnim.addListener(({value}: {value: number}) => setMissileTop(value));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (hasMissileFired) {
      Animated.timing(missileAnim, {
        duration: (maxScreenSize / missileSpeed) * 1000,
        easing: Easing.linear,
        toValue: maxScreenSize * -1,
        useNativeDriver: true,
      }).start(() => setHasFireAnimationEnded(true));
    }
  }, [hasMissileFired, missileAnim]);

  useEffect(() => {
    if (hasMissileImpacted) {
      missileAnim.stopAnimation();
    }
  }, [hasMissileImpacted, missileAnim]);

  if (hasFireAnimationEnded) {
    return null;
  }

  return <Icon style={{...styles.missile, top: missileTop}} />;
};

const Missile = ({
  craftRotation,
  Icon,
  playerLeftAnim,
  playerTopAnim,
  missileProps,
}: MissileAnimationProps) => {
  const [leftValue, setLeftValue] = useState(null);
  const [topValue, setTopValue] = useState(null);
  const craftRotationRef = useRef<null | number>(null);
  const leftValueRef = useRef(0);
  const topValueRef = useRef(0);
  const left = leftValue ?? playerLeftAnim;
  const top = topValue ?? playerTopAnim;

  leftValueRef.current = leftValue ?? 0;
  topValueRef.current = topValue ?? 0;

  useEffect(() => {
    if (missileProps.hasMissileFired) {
      craftRotationRef.current = craftRotation;
      // @ts-ignore
      setLeftValue(playerLeftAnim._value);
      // @ts-ignore
      setTopValue(playerTopAnim._value);
    }
  }, [missileProps.hasMissileFired]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    missileProps.missileAnim.addListener(({value}: {value: number}) => {
      const listeners = missileProps.missilePosition.getListeners();

      listeners.forEach(listener => {
        let missileLeft = leftValueRef.current;
        let missileTop = topValueRef.current;

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
  });

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
