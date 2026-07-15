import React from 'react';

import DualFighterIcon from 'icons/dual-fighter.svg';
import EnemyCargoShipIcon from 'icons/enemy-cargo.svg';
import EnemyUAVIcon from 'icons/enemy-uav.svg';
import PumpkinPieIcon from 'icons/pumpkin-pie.svg';
import SpeederIcon from 'icons/enemy-speeder.svg';
import {craftPixelsPerSecond, Enemies, enemyPoints} from 'Game/constants';
import {getIsThanksgivingDay} from 'Game/utils';
import {Facing, IconProps} from 'Game/types';

import CargoShipBody from './CargoShipBody';
import {AiClass} from './useEnemyCraftAnimation';

/**
 * A tunable enemy class: everything that distinguishes one variant from
 * another (stats, colour, icon, whether it fires a missile). The shared
 * `Enemy` component turns one of these into the render tree, so adding a
 * class — a normal fighter, a veteran, a future elite — is a data change
 * here, not a new component.
 */
export interface EnemyClass {
  Icon: React.FC<IconProps>;
  score: number;
  defaultCraftSpeed: number;
  craftSpeedWhenLockedOn?: number;
  // The AI traits this class has, composed independently: 'veteran' dodges
  // player missiles, 'commander' alerts the whole board on sight. An empty or
  // absent list is a plain ("basic") enemy; a class can be both.
  aiClasses?: AiClass[];
  craftColor?: string; // defaults to Colors.RED in EnemyCraft
  defaultFacing?: Facing;
  freezeWhenPlayerDetected?: boolean;
  hasMissile?: boolean;
  // Escape hatch for a class with a bespoke render tree (the cargo ship).
  Body?: React.FC<EnemyBodyProps>;
  // Which class this one releases when destroyed (the cargo ships).
  spawns?: Enemies;
}

export interface EnemyBodyProps {
  enemyClass: EnemyClass;
  id: number;
}

const isThanksgivingDay = getIsThanksgivingDay();

function RotatedDualFighterIcon({style, ...rest}: IconProps) {
  return (
    <DualFighterIcon
      style={{...(style as object), transform: [{rotate: '-45deg'}]}}
      {...rest}
    />
  );
}

const UAVIcon: React.FC<IconProps> = isThanksgivingDay
  ? ({style, ...rest}: IconProps) => (
      <PumpkinPieIcon
        style={{...(style as object), transform: [{rotate: '90deg'}]}}
        {...rest}
      />
    )
  : EnemyUAVIcon;

export const enemyClasses: Record<Enemies, EnemyClass> = {
  [Enemies.DUAL_FIGHTER]: {
    Icon: RotatedDualFighterIcon,
    score: enemyPoints[Enemies.DUAL_FIGHTER],
    defaultCraftSpeed: craftPixelsPerSecond,
    hasMissile: true,
  },
  [Enemies.VETERAN_DUAL_FIGHTER]: {
    Icon: RotatedDualFighterIcon,
    score: enemyPoints[Enemies.VETERAN_DUAL_FIGHTER],
    defaultCraftSpeed: craftPixelsPerSecond,
    craftSpeedWhenLockedOn: craftPixelsPerSecond * 1.2,
    aiClasses: ['veteran'],
    hasMissile: true,
  },
  [Enemies.UAV]: {
    Icon: UAVIcon,
    score: enemyPoints[Enemies.UAV],
    defaultCraftSpeed: craftPixelsPerSecond,
    craftSpeedWhenLockedOn: craftPixelsPerSecond * 1.6,
  },
  [Enemies.VETERAN_UAV]: {
    Icon: UAVIcon,
    score: enemyPoints[Enemies.VETERAN_UAV],
    defaultCraftSpeed: craftPixelsPerSecond,
    craftSpeedWhenLockedOn: craftPixelsPerSecond * 1.6,
    aiClasses: ['veteran'],
  },
  [Enemies.SPEEDER]: {
    Icon: SpeederIcon,
    score: enemyPoints[Enemies.SPEEDER],
    defaultCraftSpeed: craftPixelsPerSecond * 1.5,
    craftSpeedWhenLockedOn: craftPixelsPerSecond * 3,
  },
  [Enemies.VETERAN_SPEEDER]: {
    Icon: SpeederIcon,
    score: enemyPoints[Enemies.VETERAN_SPEEDER],
    defaultCraftSpeed: craftPixelsPerSecond * 1.5,
    craftSpeedWhenLockedOn: craftPixelsPerSecond * 3,
    aiClasses: ['veteran'],
  },
  [Enemies.CARGO_SHIP]: {
    Icon: EnemyCargoShipIcon,
    score: enemyPoints[Enemies.CARGO_SHIP],
    defaultCraftSpeed: craftPixelsPerSecond * 0.6,
    freezeWhenPlayerDetected: true,
    Body: CargoShipBody,
    spawns: Enemies.SPEEDER,
  },
  [Enemies.VETERAN_CARGO_SHIP]: {
    Icon: EnemyCargoShipIcon,
    score: enemyPoints[Enemies.VETERAN_CARGO_SHIP],
    defaultCraftSpeed: craftPixelsPerSecond * 0.6,
    aiClasses: ['veteran'],
    freezeWhenPlayerDetected: true,
    Body: CargoShipBody,
    spawns: Enemies.VETERAN_SPEEDER,
  },
  [Enemies.COMMANDER_DUAL_FIGHTER]: {
    Icon: RotatedDualFighterIcon,
    score: enemyPoints[Enemies.COMMANDER_DUAL_FIGHTER],
    defaultCraftSpeed: craftPixelsPerSecond,
    aiClasses: ['commander'],
    hasMissile: true,
  },
  [Enemies.VETERAN_COMMANDER_DUAL_FIGHTER]: {
    Icon: RotatedDualFighterIcon,
    score: enemyPoints[Enemies.VETERAN_COMMANDER_DUAL_FIGHTER],
    defaultCraftSpeed: craftPixelsPerSecond,
    craftSpeedWhenLockedOn: craftPixelsPerSecond * 1.2,
    aiClasses: ['veteran', 'commander'],
    hasMissile: true,
  },
};
