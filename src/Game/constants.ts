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
  CARGO_SHIP,
  DUAL_FIGHTER,
  SPEEDER,
  UAV,
  VETERAN_DUAL_FIGHTER,
  VETERAN_UAV,
}

export const enemyPoints = {
  [Enemies.CARGO_SHIP]: 100,
  [Enemies.DUAL_FIGHTER]: 300,
  [Enemies.SPEEDER]: 400,
  [Enemies.UAV]: 200,
  [Enemies.VETERAN_DUAL_FIGHTER]: 450,
  [Enemies.VETERAN_UAV]: 300,
};

export const parSecondsPerEnemy = 10;
export const timeBonusPointsPerSecond = 20;

// How far ahead (in flight time) a player missile warns a veteran craft.
// Short enough that point-blank shots still connect.
export const veteranDodgeWindowMs = 1000;

export const cloakDurationMs = 30000;
export const itemSpawnDelayMs = 15000;
export const itemSpawnIntervalMs = 20000;
export const itemDetectionRange = totalWidth * 3;

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
  [
    null,
    null,
    Enemies.DUAL_FIGHTER,
    Enemies.UAV,
    Enemies.UAV,
    Enemies.CARGO_SHIP,
    Enemies.UAV,
    Enemies.UAV,
    Enemies.DUAL_FIGHTER,
  ],
  [
    null,
    Enemies.UAV,
    Enemies.UAV,
    Enemies.DUAL_FIGHTER,
    Enemies.CARGO_SHIP,
    Enemies.CARGO_SHIP,
    Enemies.DUAL_FIGHTER,
    Enemies.UAV,
    Enemies.UAV,
  ],
  [
    null,
    Enemies.UAV,
    Enemies.DUAL_FIGHTER,
    Enemies.CARGO_SHIP,
    Enemies.DUAL_FIGHTER,
    Enemies.CARGO_SHIP,
    Enemies.DUAL_FIGHTER,
    Enemies.CARGO_SHIP,
    Enemies.DUAL_FIGHTER,
  ],
  [
    Enemies.UAV,
    Enemies.UAV,
    Enemies.CARGO_SHIP,
    Enemies.DUAL_FIGHTER,
    Enemies.CARGO_SHIP,
    Enemies.DUAL_FIGHTER,
    Enemies.CARGO_SHIP,
    Enemies.DUAL_FIGHTER,
    Enemies.UAV,
    Enemies.UAV,
  ],
  [
    Enemies.DUAL_FIGHTER,
    Enemies.CARGO_SHIP,
    Enemies.DUAL_FIGHTER,
    Enemies.CARGO_SHIP,
    Enemies.DUAL_FIGHTER,
    Enemies.DUAL_FIGHTER,
    Enemies.CARGO_SHIP,
    Enemies.DUAL_FIGHTER,
    Enemies.CARGO_SHIP,
    Enemies.DUAL_FIGHTER,
  ],
];
