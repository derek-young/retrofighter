import React, {useEffect, useRef, useState} from 'react';
import {Animated, Easing, StyleSheet} from 'react-native';

import {
  craftSize,
  maxScreenSize,
  missileSize,
  missileSpeed,
} from 'Game/gameConstants';

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

interface MissileIconProps {
  hasMissileFired: boolean;
  hasMissileImpacted: boolean;
  Icon: React.ElementType;
  missileAnim: Animated.Value;
}

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

export interface MissileProps {
  craftRotation: number;
  Icon: React.ElementType;
  leftAnim: Animated.Value;
  topAnim: Animated.Value;
  missileProps: Omit<MissileIconProps, 'Icon'>;
}

const Missile = ({
  craftRotation,
  Icon,
  leftAnim,
  topAnim,
  missileProps,
}: MissileProps) => {
  const [leftValue, setLeftValue] = useState(null);
  const [topValue, setTopValue] = useState(null);
  const craftRotationRef = useRef<null | number>(null);

  useEffect(() => {
    if (missileProps.hasMissileFired) {
      craftRotationRef.current = craftRotation;
      // @ts-ignore
      setLeftValue(leftAnim._value);
      // @ts-ignore
      setTopValue(topAnim._value);
    }
  }, [missileProps.hasMissileFired]); // eslint-disable-line react-hooks/exhaustive-deps

  const left = leftValue ?? leftAnim;
  const top = topValue ?? topAnim;

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
