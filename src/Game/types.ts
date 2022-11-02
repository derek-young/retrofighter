import {Animated} from 'react-native';

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
  hasMissileImpacted: boolean;
  Icon: React.ElementType;
  missileAnim: Animated.Value;
  startingTop?: number;
}

export interface MissileProps extends Omit<MissileIconProps, 'Icon'> {
  missilePosition: MissilePositionProps;
  onFireMissile: () => void;
  onMissileImpact: () => void;
  resetMissileState: () => void;
}

export interface MissileAnimationProps {
  craftRotation: number;
  facing: Facing;
  Icon: React.ElementType;
  leftAnim: Animated.Value;
  topAnim: Animated.Value;
  missileProps: MissileProps;
  positionOffset?: number;
}
