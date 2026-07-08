import React from 'react';
import {Animated, StyleProp, ViewStyle} from 'react-native';
import {SvgProps} from 'react-native-svg';

export type Facing = 'N' | 'S' | 'E' | 'W';

export interface MissileProps {
  hasMissileFired: boolean;
  missileAnim: Animated.Value;
  onFireAnimationEnded: () => void;
  onFireMissile: () => void;
  startingTop?: number;
}

export interface MissileAnimationProps {
  facing: Facing;
  Icon: React.FC<IconProps>;
  leftAnim: Animated.Value;
  topAnim: Animated.Value;
  missileId: string;
  missileProps: MissileProps;
  ownerId: string;
  positionOffset?: number;
  rotationAnim: Animated.Value;
  targetKind: 'player' | 'enemy';
}

export interface IconProps extends SvgProps {
  style: StyleProp<ViewStyle>;
}
