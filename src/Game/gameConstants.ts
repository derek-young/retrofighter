import {Dimensions} from 'react-native';

import {Facing} from './types';

export const leftRightPadding = 56;

export const craftSize = 20;
export const missileSize = craftSize * 0.6;
export const alleyWidth = craftSize + 2; // Column height/width
export const numColumns = 12;
export const craftPixelsPerSecond = 60; // Craft speed
export const missileSpeed = craftPixelsPerSecond * 2;

export const arenaSize = Math.min(
  Dimensions.get('window').width,
  Dimensions.get('window').height,
);
export const maxScreenSize = Math.max(
  Dimensions.get('window').width,
  Dimensions.get('window').height,
);
export const missileDuration = (maxScreenSize / missileSpeed) * 1000;
export const seperatorWidth = (arenaSize - numColumns * alleyWidth) / 11;
export const maxTop = arenaSize - 22;
export const minTop = 0;
export const maxLeft = arenaSize - 22;
export const minLeft = 0;
export const playerStartLeft = minLeft;
export const playerStartTop = maxTop;

export const defaultPlayerFacing: Facing = 'N';

export const totalWidth = alleyWidth + seperatorWidth;
