import React, {useEffect, useRef, useState} from 'react';
import {Animated, Easing, StyleSheet} from 'react-native';

import {
  craftSize,
  craftPixelsPerSecond,
  maxScreenSize,
} from 'Game/gameConstants';

const missileSize = craftSize * 0.6;
const missileSpeed = craftPixelsPerSecond * 2;

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

export interface MissileProps {
  className: Record<string, unknown>;
  fill: string;
  hasMissileFired: boolean;
  hasMissileImpacted: boolean;
  Icon: React.ElementType;
}

const Missile = ({
  className,
  fill,
  hasMissileFired,
  hasMissileImpacted,
  Icon,
}: MissileProps) => {
  const [hasFireAnimationEnded, setHasFireAnimationEnded] = useState(false);
  const [missileTop, setMissileTop] = useState(missileSize / 2);
  const missileAnim = useRef(new Animated.Value(missileTop)).current;

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

  return (
    <Icon
      fill={fill}
      height={missileSize}
      width={missileSize}
      style={{...styles.missile, ...className, top: missileTop}}
    />
  );
};

interface MissileAnimationProps {
  children: React.ReactNode;
  craftRotation: number;
  isDetachedFromParent: boolean;
  leftAnim: Animated.Value;
  topAnim: Animated.Value;
}

export const MissileAnimation = ({
  children,
  craftRotation,
  isDetachedFromParent,
  leftAnim,
  topAnim,
}: MissileAnimationProps) => {
  const [leftValue, setLeftValue] = useState(null);
  const [topValue, setTopValue] = useState(null);
  const craftRotationRef = useRef<null | number>(null);

  useEffect(() => {
    if (isDetachedFromParent) {
      craftRotationRef.current = craftRotation;
      // @ts-ignore
      setLeftValue(leftAnim._value);
      // @ts-ignore
      setTopValue(topAnim._value);
    }
  }, [isDetachedFromParent]); // eslint-disable-line react-hooks/exhaustive-deps

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
      {children}
    </Animated.View>
  );
};

export default Missile;
