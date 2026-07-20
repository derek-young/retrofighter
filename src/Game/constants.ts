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
  VETERAN_CARGO_SHIP,
  VETERAN_DUAL_FIGHTER,
  VETERAN_SPEEDER,
  VETERAN_UAV,
  COMMANDER_DUAL_FIGHTER,
  VETERAN_COMMANDER_DUAL_FIGHTER,
}

export const enemyPoints = {
  [Enemies.CARGO_SHIP]: 100,
  [Enemies.DUAL_FIGHTER]: 300,
  [Enemies.COMMANDER_DUAL_FIGHTER]: 400,
  [Enemies.SPEEDER]: 400,
  [Enemies.UAV]: 200,
  [Enemies.VETERAN_CARGO_SHIP]: 150,
  [Enemies.VETERAN_DUAL_FIGHTER]: 450,
  [Enemies.VETERAN_COMMANDER_DUAL_FIGHTER]: 550,
  [Enemies.VETERAN_SPEEDER]: 600,
  [Enemies.VETERAN_UAV]: 300,
};

// The points an enemy slot actually yields: a cargo ship converts into
// three speeders of its tier when it detects the player, so clearing the
// slot earns the speeders' points rather than the ship's own.
export const earnablePoints = {
  ...enemyPoints,
  [Enemies.CARGO_SHIP]: 3 * enemyPoints[Enemies.SPEEDER],
  [Enemies.VETERAN_CARGO_SHIP]: 3 * enemyPoints[Enemies.VETERAN_SPEEDER],
};

export const parSecondsPerEnemy = 10;
export const veteranParSecondsPerEnemy = 15;
export const timeBonusPointsPerSecond = 20;

// How far ahead (in flight time) a player missile warns a veteran craft.
export const veteranDodgeWindowMs = 1000;
// Minimum true time-to-impact (missile and craft closing speeds combined) a
// veteran needs to react: missiles that will arrive sooner than this were
// fired point-blank and always connect.
export const veteranDodgeMinimumMs = 400;

export const cloakDurationMs = 30000;
export const itemSpawnDelayMs = 15000;
export const itemSpawnIntervalMs = 20000;
export const itemDetectionRange = totalWidth * 3;

export const startingEnemies: (Enemies | null)[][] = [
  [
    null,
    null,
    null,
    Enemies.UAV,
    Enemies.UAV,
    Enemies.UAV,
    null,
    null
  ],
  [
    null,
    null,
    Enemies.UAV,
    Enemies.UAV,
    Enemies.DUAL_FIGHTER,
    Enemies.UAV,
    Enemies.UAV,
    null,
  ],
  [
    null,
    Enemies.UAV,
    Enemies.UAV,
    Enemies.DUAL_FIGHTER,
    Enemies.VETERAN_DUAL_FIGHTER,
    Enemies.DUAL_FIGHTER,
    Enemies.UAV,
    Enemies.UAV,
    null,
  ],
  [
    null,
    Enemies.VETERAN_UAV,
    Enemies.UAV,
    Enemies.DUAL_FIGHTER,
    Enemies.DUAL_FIGHTER,
    Enemies.VETERAN_DUAL_FIGHTER,
    Enemies.DUAL_FIGHTER,
    Enemies.DUAL_FIGHTER,
    Enemies.UAV,
    Enemies.VETERAN_UAV,
  ],
  [
    Enemies.VETERAN_UAV,
    Enemies.DUAL_FIGHTER,
    Enemies.DUAL_FIGHTER,
    Enemies.DUAL_FIGHTER,
    Enemies.VETERAN_DUAL_FIGHTER,
    Enemies.VETERAN_DUAL_FIGHTER,
    Enemies.DUAL_FIGHTER,
    Enemies.DUAL_FIGHTER,
    Enemies.DUAL_FIGHTER,
    Enemies.VETERAN_UAV,
  ],
  [
    null,
    null,
    Enemies.VETERAN_DUAL_FIGHTER,
    Enemies.UAV,
    Enemies.VETERAN_UAV,
    Enemies.CARGO_SHIP,
    Enemies.VETERAN_UAV,
    Enemies.UAV,
    Enemies.VETERAN_DUAL_FIGHTER,
  ],
  [
    null,
    Enemies.VETERAN_UAV,
    Enemies.VETERAN_UAV,
    Enemies.CARGO_SHIP,
    Enemies.VETERAN_COMMANDER_DUAL_FIGHTER,
    Enemies.CARGO_SHIP,
    Enemies.VETERAN_DUAL_FIGHTER,
    Enemies.VETERAN_UAV,
    Enemies.VETERAN_UAV,
  ],
  [
    null,
    Enemies.VETERAN_UAV,
    Enemies.VETERAN_DUAL_FIGHTER,
    Enemies.CARGO_SHIP,
    Enemies.VETERAN_COMMANDER_DUAL_FIGHTER,
    Enemies.CARGO_SHIP,
    Enemies.VETERAN_DUAL_FIGHTER,
    Enemies.CARGO_SHIP,
    Enemies.VETERAN_DUAL_FIGHTER,
  ],
  [
    Enemies.VETERAN_UAV,
    Enemies.VETERAN_UAV,
    Enemies.CARGO_SHIP,
    Enemies.VETERAN_COMMANDER_DUAL_FIGHTER,
    Enemies.VETERAN_CARGO_SHIP,
    Enemies.VETERAN_COMMANDER_DUAL_FIGHTER,
    Enemies.CARGO_SHIP,
    Enemies.VETERAN_DUAL_FIGHTER,
    Enemies.VETERAN_UAV,
    Enemies.VETERAN_UAV,
  ],
  [
    Enemies.VETERAN_DUAL_FIGHTER,
    Enemies.VETERAN_CARGO_SHIP,
    Enemies.VETERAN_COMMANDER_DUAL_FIGHTER,
    Enemies.VETERAN_CARGO_SHIP,
    Enemies.VETERAN_COMMANDER_DUAL_FIGHTER,
    Enemies.VETERAN_COMMANDER_DUAL_FIGHTER,
    Enemies.VETERAN_CARGO_SHIP,
    Enemies.VETERAN_COMMANDER_DUAL_FIGHTER,
    Enemies.VETERAN_CARGO_SHIP,
    Enemies.VETERAN_DUAL_FIGHTER,
  ],
];
