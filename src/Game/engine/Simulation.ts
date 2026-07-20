import {Facing} from 'Game/types';
import {
  alleyWidth,
  craftSize,
  maxScreenSize,
  missileSpeed,
  veteranDodgeMinimumMs,
  veteranDodgeWindowMs,
} from 'Game/constants';
import {getIsPlayerInLineOfSight} from 'Game/enemy/animation';
import {isVerticalFacing} from 'Game/utils';

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
  onThreatened?: (threat: {facing: Facing}) => void;
  // Fired on every other enemy when a commander first spots the player.
  onCommanderAlert?: (playerPosition: Position) => void;
}

interface CraftEntity extends CraftCallbacks {
  id: string;
  kind: CraftKind;
  top: number;
  left: number;
  facing: Facing;
  segment: Segment | null;
  isCollidable: boolean;
  isCommander: boolean;
  isPlayerInLineOfSight: boolean;
  hasShield: boolean;
  onShieldConsumed?: () => void;
  cloak: {
    remainingMs: number;
    since: number | null;
    onEnded?: () => void;
  } | null;
  clusterBombCount: number;
  onClusterBombCountChange?: (count: number) => void;
}

export interface CraftConfig extends CraftCallbacks {
  kind: CraftKind;
  top: number;
  left: number;
  facing: Facing;
  isCollidable: boolean;
  isCommander?: boolean;
}

export interface MissileConfig {
  originTop: number;
  originLeft: number;
  facing: Facing;
  ownerId: string;
  positionOffset: number;
  startValue: number;
  targetKind: TargetKind;
  isClusterBomb?: boolean;
  onImpact: () => void;
}

interface MissileEntity extends MissileConfig {
  id: string;
  value: number; // anim value when startedAt was last (re)based
  speed: number; // px per second: base missile speed + owner's forward speed at launch
  startedAt: number | null;
  threatenedCraftIds: Set<string>; // crafts already warned about this missile
  piercing: boolean; // cluster munitions carry through eliminated crafts
}

export type ItemKind = 'shield' | 'cloak' | 'clusterBomb';

export interface ItemEffectsSnapshot {
  hasShield: boolean;
  cloakRemainingMs: number;
  clusterBombCount: number;
}

export interface ItemConfig {
  kind: ItemKind;
  top: number;
  left: number;
  onPickedUp: (craftId: string) => void;
}

interface ItemEntity extends ItemConfig {
  id: string;
}

export interface MissileInfo {
  id: string;
  facing: Facing;
  position: Position;
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
 * A missile threatens a craft when it approaches from the craft's front or
 * rear and its true time-to-impact — accounting for the craft's own motion
 * toward or away from the missile — falls within the dodge window, but not
 * so soon that the craft has no time to react. This mirrors the
 * line-of-sight test from the missile's perspective, widened by half the
 * craft's box since the missile is a point. Missiles crossing the craft's
 * alley from a side corridor are invisible to it.
 */
function getIsMissileThreat(
  missilePos: Position,
  missileFacing: Facing,
  missileSpeed: number,
  craftPos: Position,
  craftFacing: Facing,
  craftVelocity: {top: number; left: number},
) {
  if (isVerticalFacing(missileFacing) !== isVerticalFacing(craftFacing)) {
    return false;
  }

  const centerTop = craftPos.top + craftSize / 2;
  const centerLeft = craftPos.left + craftSize / 2;
  const lateralTolerance = alleyWidth / 2 + craftSize / 2;

  let distanceAhead: number;
  let lateralOffset: number;
  let closingSpeed: number;

  switch (missileFacing) {
    case 'N':
      distanceAhead = missilePos.top - centerTop;
      lateralOffset = Math.abs(missilePos.left - centerLeft);
      closingSpeed = missileSpeed + craftVelocity.top;
      break;
    case 'S':
      distanceAhead = centerTop - missilePos.top;
      lateralOffset = Math.abs(missilePos.left - centerLeft);
      closingSpeed = missileSpeed - craftVelocity.top;
      break;
    case 'E':
      distanceAhead = centerLeft - missilePos.left;
      lateralOffset = Math.abs(missilePos.top - centerTop);
      closingSpeed = missileSpeed - craftVelocity.left;
      break;
    case 'W':
      distanceAhead = missilePos.left - centerLeft;
      lateralOffset = Math.abs(missilePos.top - centerTop);
      closingSpeed = missileSpeed + craftVelocity.left;
      break;
  }

  if (closingSpeed <= 0) {
    return false;
  }

  const arrivalMs = (distanceAhead / closingSpeed) * 1000;

  return (
    distanceAhead > 0 &&
    lateralOffset < lateralTolerance &&
    arrivalMs >= veteranDodgeMinimumMs &&
    arrivalMs <= veteranDodgeWindowMs
  );
}

/**
 * The craft's velocity in px/s, positive toward increasing top/left. Zero
 * when idle (advanceCraft clears finished segments before this runs) or
 * while the simulation is paused.
 */
function getCraftVelocity(craft: CraftEntity): {top: number; left: number} {
  const velocity = {top: 0, left: 0};
  const segment = craft.segment;

  if (segment && segment.startedAt !== null) {
    velocity[segment.axis] =
      Math.sign(segment.to - segment.from) * segment.speed;
  }

  return velocity;
}

/**
 * The box a deployed shield occupies: one craft-size directly behind the
 * craft, opposite its facing. It swings around as the craft turns.
 */
function getShieldBox(craft: CraftEntity): Position {
  switch (craft.facing) {
    case 'N':
      return {top: craft.top + craftSize, left: craft.left};
    case 'S':
      return {top: craft.top - craftSize, left: craft.left};
    case 'E':
      return {top: craft.top, left: craft.left - craftSize};
    case 'W':
      return {top: craft.top, left: craft.left + craftSize};
  }
}

/**
 * The authoritative game state. All motion in the game is linear, positions are derived
 * arithmetically from each entity's movement segment (origin, target, speed,
 * start time). A fixed-interval tick runs the game rules (craft collisions,
 * missile impacts, line of sight) against those derived positions, leaving
 * the JS thread idle between ticks so touch events dispatch immediately.
 *
 * Visuals are rendered separately with native-driver Animated timings built
 * from the same parameters, so they stay in agreement with the simulation
 * without any per-frame JS work.
 */
class Simulation {
  private crafts = new Map<string, CraftEntity>();
  private missiles = new Map<string, MissileEntity>();
  private items = new Map<string, ItemEntity>();
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private isPaused = false;
  private clockStarted = false;
  private clockActiveMs = 0;
  private clockRunningSince: number | null = null;

  /**
   * Starts the level clock. Idempotent, so the player respawning (which
   * re-triggers the first-move effect) doesn't restart it.
   */
  startClock(now = Date.now()): void {
    if (!this.clockStarted) {
      this.clockStarted = true;
      this.clockRunningSince = this.isPaused ? null : now;
    }
  }

  /**
   * Active (unpaused) time since startClock. Pause folds the running span
   * into clockActiveMs and resume rebases, mirroring segment bookkeeping.
   */
  getElapsedMs(now = Date.now()): number {
    return (
      this.clockActiveMs +
      (this.clockRunningSince === null ? 0 : now - this.clockRunningSince)
    );
  }

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
    this.items.clear();
  }

  addCraft(id: string, config: CraftConfig): void {
    this.crafts.set(id, {
      ...config,
      id,
      segment: null,
      isCommander: config.isCommander ?? false,
      isPlayerInLineOfSight: false,
      hasShield: false,
      cloak: null,
      clusterBombCount: 0,
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

      // A respawned craft loses its power-ups; the end callbacks fire so any
      // UI state tied to the effects clears with them.
      if (craft.hasShield) {
        this.consumeShield(craft);
      }
      if (craft.cloak) {
        const onEnded = craft.cloak.onEnded;
        craft.cloak = null;
        onEnded?.();
      }
      if (craft.clusterBombCount > 0) {
        craft.clusterBombCount = 0;
        craft.onClusterBombCountChange?.(0);
        craft.onClusterBombCountChange = undefined;
      }
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

  addItem(id: string, config: ItemConfig): void {
    this.items.set(id, {...config, id});
  }

  removeItem(id: string): void {
    this.items.delete(id);
  }

  getItems(): Array<{id: string; kind: ItemKind; position: Position}> {
    return Array.from(this.items.values()).map(item => ({
      id: item.id,
      kind: item.kind,
      position: {top: item.top, left: item.left},
    }));
  }

  getCraftPositions(
    now = Date.now(),
  ): Array<{id: string; kind: CraftKind; position: Position}> {
    return Array.from(this.crafts.values()).map(craft => {
      this.advanceCraft(craft, now);

      return {
        id: craft.id,
        kind: craft.kind,
        position: {top: craft.top, left: craft.left},
      };
    });
  }

  setShielded(id: string, shielded: boolean, onConsumed?: () => void): void {
    const craft = this.crafts.get(id);

    if (craft) {
      craft.hasShield = shielded;
      craft.onShieldConsumed = shielded ? onConsumed : undefined;
    }
  }

  setCloaked(
    id: string,
    durationMs: number,
    onEnded?: () => void,
    now = Date.now(),
  ): void {
    const craft = this.crafts.get(id);

    if (craft) {
      craft.cloak = {
        remainingMs: durationMs,
        since: this.isPaused ? null : now,
        onEnded,
      };
    }
  }

  isCloaked(id: string): boolean {
    return Boolean(this.crafts.get(id)?.cloak);
  }

  /**
   * A snapshot of a craft's active item effects, e.g. for carrying the
   * player's power-ups over into the next level's fresh simulation.
   */
  getItemEffects(id: string, now = Date.now()): ItemEffectsSnapshot {
    const craft = this.crafts.get(id);

    if (!craft) {
      return {hasShield: false, cloakRemainingMs: 0, clusterBombCount: 0};
    }

    const cloakElapsedMs =
      craft.cloak === null || craft.cloak.since === null
        ? 0
        : now - craft.cloak.since;

    return {
      hasShield: craft.hasShield,
      cloakRemainingMs: craft.cloak
        ? Math.max(0, craft.cloak.remainingMs - cloakElapsedMs)
        : 0,
      clusterBombCount: craft.clusterBombCount,
    };
  }

  armClusterBomb(id: string, onCountChange?: (count: number) => void): void {
    const craft = this.crafts.get(id);

    if (craft) {
      craft.clusterBombCount += 1;

      if (onCountChange) {
        craft.onClusterBombCountChange = onCountChange;
      }

      craft.onClusterBombCountChange?.(craft.clusterBombCount);
    }
  }

  private consumeShield(craft: CraftEntity): void {
    craft.hasShield = false;
    craft.onShieldConsumed?.();
    craft.onShieldConsumed = undefined;
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

  /**
   * Halts the craft and places it at an exact position (e.g. snapping a
   * freezing craft back onto the grid).
   */
  setPosition(id: string, {top, left}: Position): void {
    const craft = this.crafts.get(id);

    if (craft) {
      craft.top = top;
      craft.left = left;
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
    const owner = this.crafts.get(config.ownerId);

    // A cluster bomb is a dedicated missile: firing it spends one of the
    // owner's stockpiled bombs. Regular missiles never consume a bomb or
    // pierce.
    if (config.isClusterBomb && owner && owner.clusterBombCount > 0) {
      owner.clusterBombCount -= 1;
      owner.onClusterBombCountChange?.(owner.clusterBombCount);
    }

    this.missiles.set(id, {
      ...config,
      id,
      value: config.startValue,
      speed: missileSpeed + this.getLaunchSpeedBonus(owner, config.facing, now),
      startedAt: this.isPaused ? null : now,
      threatenedCraftIds: new Set(),
      piercing: Boolean(config.isClusterBomb),
    });
  }

  /**
   * The owner's speed along the line of fire at launch. Missiles inherit it
   * so a craft firing while charging — a locked-on speeder with a cluster
   * bomb moves faster than a base missile — can never outrun its own shot.
   */
  private getLaunchSpeedBonus(
    owner: CraftEntity | undefined,
    facing: Facing,
    now: number,
  ): number {
    if (!owner) {
      return 0;
    }

    this.advanceCraft(owner, now);
    const velocity = getCraftVelocity(owner);

    switch (facing) {
      case 'N':
        return Math.max(0, -velocity.top);
      case 'S':
        return Math.max(0, velocity.top);
      case 'E':
        return Math.max(0, velocity.left);
      case 'W':
        return Math.max(0, -velocity.left);
    }
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

  /**
   * The missile's travel speed in px/s (base missile speed plus the owner's
   * forward speed at launch). Undefined when the missile is not in flight.
   */
  getMissileSpeed(id: string): number | undefined {
    return this.missiles.get(id)?.speed;
  }

  getMissiles(targetKind: TargetKind, now = Date.now()): MissileInfo[] {
    return Array.from(this.missiles.values())
      .filter(missile => missile.targetKind === targetKind)
      .map(missile => ({
        id: missile.id,
        facing: missile.facing,
        position: this.missilePosition(
          missile,
          this.missileValue(missile, now),
        ),
      }));
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

    if (this.clockRunningSince !== null) {
      this.clockActiveMs += now - this.clockRunningSince;
      this.clockRunningSince = null;
    }

    this.crafts.forEach(craft => {
      this.advanceCraft(craft, now);
      if (craft.segment) {
        craft.segment.from = craft[craft.segment.axis];
        craft.segment.startedAt = null;
      }
      if (craft.cloak && craft.cloak.since !== null) {
        craft.cloak.remainingMs -= now - craft.cloak.since;
        craft.cloak.since = null;
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

    if (this.clockStarted) {
      this.clockRunningSince = now;
    }

    this.crafts.forEach(craft => {
      if (craft.segment && craft.segment.startedAt === null) {
        craft.segment.startedAt = now;
      }
      if (craft.cloak && craft.cloak.since === null) {
        craft.cloak.since = now;
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
      if (
        craft.cloak &&
        craft.cloak.since !== null &&
        now - craft.cloak.since >= craft.cloak.remainingMs
      ) {
        const onEnded = craft.cloak.onEnded;
        craft.cloak = null;
        onEnded?.();
      }
    });

    this.items.forEach(item => {
      const itemPos = {top: item.top, left: item.left};

      for (const craft of this.crafts.values()) {
        if (!craft.isCollidable) {
          continue;
        }

        this.advanceCraft(craft, now);

        if (doBoxesOverlap(itemPos, {top: craft.top, left: craft.left})) {
          this.items.delete(item.id);
          item.onPickedUp(craft.id);
          break;
        }
      }
    });

    this.crafts.forEach(craft => {
      if (craft.kind !== 'enemy') {
        return;
      }

      this.advanceCraft(craft, now);
      const craftPos = {top: craft.top, left: craft.left};

      if (craft.onLineOfSightChange) {
        const isInSight =
          !!player?.isCollidable &&
          !player?.cloak &&
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

          // A commander spotting the player alerts every other enemy on the
          // board (edge-triggered, so once per acquisition).
          if (isInSight && craft.isCommander && playerPos) {
            this.crafts.forEach(other => {
              if (other.id !== craft.id && other.kind === 'enemy') {
                other.onCommanderAlert?.(playerPos);
              }
            });
          }
        }
      }

      if (player?.isCollidable && playerPos && craft.isCollidable) {
        // Rear shields absorb a ram: the craft overlapping a shield box is
        // eliminated alone. Shield boxes win when both boxes overlap in the
        // same tick.
        if (
          player.hasShield &&
          doBoxesOverlap(getShieldBox(player), craftPos)
        ) {
          this.consumeShield(player);
          craft.isCollidable = false;
          craft.onEliminated?.();
        } else if (
          craft.hasShield &&
          doBoxesOverlap(getShieldBox(craft), playerPos)
        ) {
          this.consumeShield(craft);
          player.isCollidable = false;
          player.onEliminated?.();
        } else if (doBoxesOverlap(craftPos, playerPos)) {
          player.isCollidable = false;
          craft.isCollidable = false;
          craft.onEliminated?.();
          player.onEliminated?.();
        }
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
        if (player?.isCollidable && playerPos) {
          if (
            player.hasShield &&
            isPointInBox(missilePos, getShieldBox(player))
          ) {
            this.consumeShield(player);
            this.missiles.delete(missile.id);
            missile.onImpact();
          } else if (isPointInBox(missilePos, playerPos)) {
            player.isCollidable = false;
            this.missiles.delete(missile.id);
            player.onEliminated?.();
            missile.onImpact();
          }
        }
        return;
      }

      for (const craft of this.crafts.values()) {
        if (craft.kind !== 'enemy' || !craft.isCollidable) {
          continue;
        }

        const craftPos = {top: craft.top, left: craft.left};

        if (
          craft.onThreatened &&
          !missile.threatenedCraftIds.has(craft.id) &&
          getIsMissileThreat(
            missilePos,
            missile.facing,
            missile.speed,
            craftPos,
            craft.facing,
            getCraftVelocity(craft),
          )
        ) {
          missile.threatenedCraftIds.add(craft.id);
          craft.onThreatened({facing: missile.facing});
        }

        // Absorbing a missile kills it outright, so a rear shield also stops
        // a piercing cluster shot.
        if (craft.hasShield && isPointInBox(missilePos, getShieldBox(craft))) {
          this.consumeShield(craft);
          this.missiles.delete(missile.id);
          missile.onImpact();
          break;
        }

        if (isPointInBox(missilePos, craftPos)) {
          craft.isCollidable = false;
          craft.onEliminated?.();

          // Cluster munitions carry through to every craft in the line of
          // fire; the missile flies on until it leaves the screen.
          if (missile.piercing) {
            continue;
          }

          this.missiles.delete(missile.id);
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

    return missile.value - elapsedSeconds * missile.speed;
  }

  /**
   * The missile's position on screen: the local point (positionOffset,
   * value) inside the craft-sized launch container, rotated about the
   * container's center exactly as the Missile component renders it.
   */
  private missilePosition(missile: MissileEntity, value: number): Position {
    const {facing, originLeft, originTop, positionOffset} = missile;

    switch (facing) {
      case 'N':
        return {left: originLeft + positionOffset, top: originTop + value};
      case 'E':
        return {
          left: originLeft + craftSize - value,
          top: originTop + positionOffset,
        };
      case 'S':
        return {
          left: originLeft + craftSize - positionOffset,
          top: originTop + craftSize - value,
        };
      case 'W':
        return {
          left: originLeft + value,
          top: originTop + craftSize - positionOffset,
        };
    }
  }
}

export default Simulation;
