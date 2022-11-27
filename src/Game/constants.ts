import {Dimensions} from 'react-native';

import {Facing} from './types';

export const craftSize = 20;
export const seperatorWidth = 16;
export const missileSize = craftSize * 0.6;
export const numColumns = 10;
export const craftPixelsPerSecond = 50; // Craft speed
export const missileSpeed = craftPixelsPerSecond * 2.2;

export const arenaSize = Math.min(
  Dimensions.get('window').width,
  Dimensions.get('window').height,
);
export const maxScreenSize = Math.max(
  Dimensions.get('window').width,
  Dimensions.get('window').height,
);
export const missileDuration = (maxScreenSize / missileSpeed) * 1000;
export const alleyWidth =
  (arenaSize - (numColumns - 1) * seperatorWidth) / numColumns;
export const maxTop = arenaSize - 22;
export const minTop = 0;
export const maxLeft = arenaSize - 22;
export const minLeft = 0;
export const playerStartLeft = minLeft;
export const playerStartTop = maxTop;

export const defaultPlayerFacing: Facing = 'N';

export const totalWidth = alleyWidth + seperatorWidth;

export enum Enemies {
  DUAL_FIGHTER,
  SPEEDER,
  UAV,
}

export const enemyPoints = {
  [Enemies.UAV]: 200,
  [Enemies.DUAL_FIGHTER]: 300,
  [Enemies.SPEEDER]: 400,
};

export const startingEnemies: (Enemies | null)[][] = [
  [null, null, null, Enemies.UAV, null, Enemies.UAV, null, Enemies.UAV],
  [
    null,
    null,
    null,
    Enemies.UAV,
    Enemies.UAV,
    Enemies.DUAL_FIGHTER,
    Enemies.UAV,
    Enemies.UAV,
  ],
  [
    null,
    null,
    Enemies.UAV,
    Enemies.UAV,
    Enemies.DUAL_FIGHTER,
    Enemies.DUAL_FIGHTER,
    Enemies.DUAL_FIGHTER,
    Enemies.UAV,
    Enemies.UAV,
  ],
  [
    null,
    Enemies.UAV,
    Enemies.UAV,
    Enemies.DUAL_FIGHTER,
    Enemies.DUAL_FIGHTER,
    Enemies.DUAL_FIGHTER,
    Enemies.DUAL_FIGHTER,
    Enemies.DUAL_FIGHTER,
    Enemies.UAV,
    Enemies.UAV,
  ],
  [
    Enemies.DUAL_FIGHTER,
    Enemies.DUAL_FIGHTER,
    Enemies.DUAL_FIGHTER,
    Enemies.DUAL_FIGHTER,
    Enemies.DUAL_FIGHTER,
    Enemies.DUAL_FIGHTER,
    Enemies.DUAL_FIGHTER,
    Enemies.DUAL_FIGHTER,
    Enemies.DUAL_FIGHTER,
    Enemies.DUAL_FIGHTER,
  ],
];
