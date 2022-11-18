import React from 'react';
import {Animated, StyleProp, ViewStyle} from 'react-native';
import {SvgProps} from 'react-native-svg';

export type Facing = 'N' | 'S' | 'E' | 'W';

export type MissilePositionCallback = (position: {
  left: number;
  top: number;
}) => void;

interface MissilePositionProps {
  addListener: (callback: MissilePositionCallback) => void;
  getListeners: () => MissilePositionCallback[];
}

export interface MissileIconProps {
  hasMissileFired: boolean;
  Icon: React.ElementType;
  missileAnim: Animated.Value;
  onFireAnimationEnded: () => void;
  startingTop?: number;
}

export interface MissileProps extends Omit<MissileIconProps, 'Icon'> {
  missilePosition: MissilePositionProps;
  onFireMissile: () => void;
}

export interface MissileAnimationProps {
  craftRotation: number;
  facing: Facing;
  Icon: React.FC<IconProps>;
  leftAnim: Animated.Value;
  topAnim: Animated.Value;
  missileProps: MissileProps;
  positionOffset?: number;
}

export interface IconProps extends SvgProps {
  style: StyleProp<ViewStyle>;
}
