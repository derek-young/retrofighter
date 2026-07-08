import {Facing} from 'Game/types';
import {
  alleyWidth,
  craftSize,
  maxScreenSize,
  missileSpeed,
} from 'Game/constants';
import {getIsPlayerInLineOfSight} from 'Game/enemy/animation';

export const PLAYER_ID = 'player';
export const SIMULATION_TICK_MS = 33;

export type Axis = 'top' | 'left';
export type CraftKind = 'player' | 'enemy';
export type TargetKind = CraftKind;

export interface Position {
  top: number;
  left: number;
}

interface Segment {
  axis: Axis;
  from: number;
  to: number;
  speed: number; // px per second, always positive
  startedAt: number | null; // null while the simulation is paused
}

export interface CraftCallbacks {
  onEliminated?: () => void;
  onLineOfSightChange?: (isPlayerInLineOfSight: boolean) => void;
}

interface CraftEntity extends CraftCallbacks {
  id: string;
  kind: CraftKind;
  top: number;
  left: number;
  facing: Facing;
  segment: Segment | null;
  isCollidable: boolean;
  isPlayerInLineOfSight: boolean;
}

export interface CraftConfig extends CraftCallbacks {
  kind: CraftKind;
  top: number;
  left: number;
  facing: Facing;
  isCollidable: boolean;
}

export interface MissileConfig {
  originTop: number;
  originLeft: number;
  facing: Facing;
  positionOffset: number;
  startValue: number;
  targetKind: TargetKind;
  onImpact: () => void;
}

interface MissileEntity extends MissileConfig {
  id: string;
  value: number; // anim value when startedAt was last (re)based
  startedAt: number | null;
}

function doBoxesOverlap(a: Position, b: Position) {
  return (
    a.top <= b.top + craftSize &&
    b.top <= a.top + craftSize &&
    a.left <= b.left + craftSize &&
    b.left <= a.left + craftSize
  );
}

function isPointInBox(point: Position, box: Position) {
  return (
    point.left >= box.left &&
    point.left <= box.left + craftSize &&
    point.top >= box.top &&
    point.top <= box.top + craftSize
  );
}

/**
 * The authoritative game state. All motion in the game is linear, so positions are derived
 * arithmetically from each entity's movement segment (origin, target, speed,
 * start time). A fixed-interval tick runs the game rules (craft collisions,
 * missile impacts, line of sight) against those derived positions, leaving
 * the JS thread idle between ticks.
 *
 * Visuals are rendered separately with native-driver Animated timings built
 * from the same parameters, so they stay in agreement with the simulation
 * without any per-frame JS work.
 */
class Simulation {
  private crafts = new Map<string, CraftEntity>();
  private missiles = new Map<string, MissileEntity>();
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private isPaused = false;

  start(): void {
    if (this.intervalId === null) {
      this.intervalId = setInterval(() => this.tick(), SIMULATION_TICK_MS);
    }
  }

  destroy(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.crafts.clear();
    this.missiles.clear();
  }

  addCraft(id: string, config: CraftConfig): void {
    this.crafts.set(id, {
      ...config,
      id,
      segment: null,
      isPlayerInLineOfSight: false,
    });
  }

  removeCraft(id: string): void {
    this.crafts.delete(id);
  }

  resetCraft(
    id: string,
    {top, left, facing}: {top: number; left: number; facing: Facing},
  ): void {
    const craft = this.crafts.get(id);

    if (craft) {
      craft.top = top;
      craft.left = left;
      craft.facing = facing;
      craft.segment = null;
      craft.isCollidable = false;
    }
  }

  setCraftCallbacks(id: string, callbacks: CraftCallbacks): void {
    const craft = this.crafts.get(id);

    if (craft) {
      Object.assign(craft, callbacks);
    }
  }

  setCollidable(id: string, isCollidable: boolean): void {
    const craft = this.crafts.get(id);

    if (craft) {
      craft.isCollidable = isCollidable;
    }
  }

  setFacing(id: string, facing: Facing): void {
    const craft = this.crafts.get(id);

    if (craft) {
      craft.facing = facing;
    }
  }

  getFacing(id: string): Facing | undefined {
    return this.crafts.get(id)?.facing;
  }

  /**
   * Starts a linear movement from the craft's current position. The visual
   * animation for the same movement should be started alongside with a
   * duration of |to - from| / speed.
   */
  setSegment(
    id: string,
    {axis, to, speed}: {axis: Axis; to: number; speed: number},
    now = Date.now(),
  ): void {
    const craft = this.crafts.get(id);

    if (!craft) {
      return;
    }

    this.advanceCraft(craft, now);
    craft.segment = {
      axis,
      from: craft[axis],
      to,
      speed,
      startedAt: this.isPaused ? null : now,
    };
  }

  stopCraft(id: string, now = Date.now()): void {
    const craft = this.crafts.get(id);

    if (craft) {
      this.advanceCraft(craft, now);
      craft.segment = null;
    }
  }

  getPosition(id: string, now = Date.now()): Position | undefined {
    const craft = this.crafts.get(id);

    if (!craft) {
      return undefined;
    }

    this.advanceCraft(craft, now);

    return {top: craft.top, left: craft.left};
  }

  addMissile(id: string, config: MissileConfig, now = Date.now()): void {
    this.missiles.set(id, {
      ...config,
      id,
      value: config.startValue,
      startedAt: this.isPaused ? null : now,
    });
  }

  removeMissile(id: string): void {
    this.missiles.delete(id);
  }

  /**
   * The missile's current animation value (distance travelled is
   * startValue - value). Returns undefined when the missile is not in flight.
   */
  getMissileValue(id: string, now = Date.now()): number | undefined {
    const missile = this.missiles.get(id);

    return missile === undefined ? undefined : this.missileValue(missile, now);
  }

  pause(now = Date.now()): void {
    if (this.isPaused) {
      return;
    }

    this.isPaused = true;

    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.crafts.forEach(craft => {
      this.advanceCraft(craft, now);
      if (craft.segment) {
        craft.segment.from = craft[craft.segment.axis];
        craft.segment.startedAt = null;
      }
    });
    this.missiles.forEach(missile => {
      missile.value = this.missileValue(missile, now);
      missile.startedAt = null;
    });
  }

  resume(now = Date.now()): void {
    if (!this.isPaused) {
      return;
    }

    this.isPaused = false;

    this.crafts.forEach(craft => {
      if (craft.segment && craft.segment.startedAt === null) {
        craft.segment.startedAt = now;
      }
    });
    this.missiles.forEach(missile => {
      if (missile.startedAt === null) {
        missile.startedAt = now;
      }
    });

    this.start();
  }

  tick(now = Date.now()): void {
    const player = this.crafts.get(PLAYER_ID);
    const playerPos = player && this.getPosition(PLAYER_ID, now);

    this.crafts.forEach(craft => {
      if (craft.kind !== 'enemy') {
        return;
      }

      this.advanceCraft(craft, now);
      const craftPos = {top: craft.top, left: craft.left};

      if (craft.onLineOfSightChange) {
        const isInSight =
          !!player?.isCollidable &&
          !!playerPos &&
          getIsPlayerInLineOfSight(
            craft.facing,
            craftPos.top,
            craftPos.left,
            playerPos.top,
            playerPos.left,
          );

        if (isInSight !== craft.isPlayerInLineOfSight) {
          craft.isPlayerInLineOfSight = isInSight;
          craft.onLineOfSightChange(isInSight);
        }
      }

      if (
        player?.isCollidable &&
        playerPos &&
        craft.isCollidable &&
        doBoxesOverlap(craftPos, playerPos)
      ) {
        player.isCollidable = false;
        craft.isCollidable = false;
        craft.onEliminated?.();
        player.onEliminated?.();
      }
    });

    Array.from(this.missiles.values()).forEach(missile => {
      const value = this.missileValue(missile, now);

      if (value <= -maxScreenSize) {
        this.missiles.delete(missile.id);
        return;
      }

      const missilePos = this.missilePosition(missile, value);

      if (missile.targetKind === 'player') {
        if (
          player?.isCollidable &&
          playerPos &&
          isPointInBox(missilePos, playerPos)
        ) {
          player.isCollidable = false;
          this.missiles.delete(missile.id);
          player.onEliminated?.();
          missile.onImpact();
        }
        return;
      }

      for (const craft of this.crafts.values()) {
        if (craft.kind !== 'enemy' || !craft.isCollidable) {
          continue;
        }

        if (isPointInBox(missilePos, {top: craft.top, left: craft.left})) {
          craft.isCollidable = false;
          this.missiles.delete(missile.id);
          craft.onEliminated?.();
          missile.onImpact();
          break;
        }
      }
    });
  }

  private advanceCraft(craft: CraftEntity, now: number): void {
    const segment = craft.segment;

    if (!segment) {
      return;
    }

    const elapsedSeconds =
      segment.startedAt === null ? 0 : (now - segment.startedAt) / 1000;
    const distance = Math.abs(segment.to - segment.from);
    const travelled = Math.min(elapsedSeconds * segment.speed, distance);

    craft[segment.axis] =
      segment.from + Math.sign(segment.to - segment.from) * travelled;

    if (travelled >= distance) {
      craft.segment = null;
    }
  }

  private missileValue(missile: MissileEntity, now: number): number {
    const elapsedSeconds =
      missile.startedAt === null ? 0 : (now - missile.startedAt) / 1000;

    return missile.value - elapsedSeconds * missileSpeed;
  }

  /**
   * Mirrors the facing-specific offsets the Missile component applies when
   * rendering the missile inside its rotated container.
   */
  private missilePosition(missile: MissileEntity, value: number): Position {
    const {facing, originLeft, originTop, positionOffset} = missile;

    switch (facing) {
      case 'N':
        return {left: originLeft + positionOffset, top: originTop + value};
      case 'E':
        return {left: originLeft - value, top: originTop + positionOffset};
      case 'S':
        return {
          left: originLeft + alleyWidth - positionOffset,
          top: originTop - value,
        };
      case 'W':
        return {
          left: originLeft + value,
          top: originTop + alleyWidth - positionOffset,
        };
    }
  }
}

export default Simulation;
