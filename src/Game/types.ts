import {Animated} from 'react-native';

export type Facing = 'N' | 'S' | 'E' | 'W';

export type MissilePositionCallback = (position: {
  left: number;
  top: number;
}) => void;

export interface MissilePosition {
  addListener: (callback: MissilePositionCallback) => void;
  getListeners: () => MissilePositionCallback[];
}

export interface MissileIconProps {
  hasMissileFired: boolean;
  hasMissileImpacted: boolean;
  Icon: React.ElementType;
  missileAnim: Animated.Value;
}

export interface MissileProps extends Omit<MissileIconProps, 'Icon'> {
  missilePosition: MissilePosition;
  onFireMissile: () => void;
  onMissileImpact: () => void;
}

export interface MissileAnimationProps {
  craftRotation: number;
  Icon: React.ElementType;
  playerLeftAnim: Animated.Value;
  playerTopAnim: Animated.Value;
  missileProps: MissileProps;
}
