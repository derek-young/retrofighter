import {craftSize, missileSpeed} from 'Game/constants';
import {Facing} from 'Game/types';

import Simulation, {PLAYER_ID} from './Simulation';

const simulations: Simulation[] = [];

// Destroy every simulation so tests that resume() (which starts the real
// tick interval) don't leave open handles that keep jest alive.
afterEach(() => {
  simulations.splice(0).forEach(simulation => simulation.destroy());
});

function createSimulationWithPlayer({
  top = 500,
  left = 0,
  isCollidable = true,
  onEliminated = () => {},
} = {}) {
  const simulation = new Simulation();

  simulations.push(simulation);
  simulation.addCraft(PLAYER_ID, {
    kind: 'player',
    top,
    left,
    facing: 'N',
    isCollidable,
    onEliminated,
  });

  return simulation;
}

describe('craft movement', () => {
  it('derives positions from a segment over time', () => {
    const simulation = createSimulationWithPlayer();

    simulation.setSegment(PLAYER_ID, {axis: 'top', to: 0, speed: 50}, 0);

    expect(simulation.getPosition(PLAYER_ID, 0)).toEqual({top: 500, left: 0});
    expect(simulation.getPosition(PLAYER_ID, 1000)).toEqual({
      top: 450,
      left: 0,
    });
    expect(simulation.getPosition(PLAYER_ID, 4000)).toEqual({
      top: 300,
      left: 0,
    });
  });

  it('clamps at the segment target', () => {
    const simulation = createSimulationWithPlayer();

    simulation.setSegment(PLAYER_ID, {axis: 'top', to: 400, speed: 50}, 0);

    expect(simulation.getPosition(PLAYER_ID, 60000)).toEqual({
      top: 400,
      left: 0,
    });
  });

  it('starts a new segment from the current derived position', () => {
    const simulation = createSimulationWithPlayer();

    simulation.setSegment(PLAYER_ID, {axis: 'top', to: 0, speed: 50}, 0);
    simulation.setSegment(PLAYER_ID, {axis: 'left', to: 100, speed: 50}, 2000);

    expect(simulation.getPosition(PLAYER_ID, 3000)).toEqual({
      top: 400,
      left: 50,
    });
  });

  it('freezes positions while paused and resumes without a jump', () => {
    const simulation = createSimulationWithPlayer();

    simulation.setSegment(PLAYER_ID, {axis: 'top', to: 0, speed: 50}, 0);
    simulation.pause(1000);

    expect(simulation.getPosition(PLAYER_ID, 5000)).toEqual({
      top: 450,
      left: 0,
    });

    simulation.resume(9000);

    expect(simulation.getPosition(PLAYER_ID, 10000)).toEqual({
      top: 400,
      left: 0,
    });
  });
});

describe('level clock', () => {
  it('does not run before startClock', () => {
    const simulation = createSimulationWithPlayer();

    expect(simulation.getElapsedMs(5000)).toEqual(0);
  });

  it('accumulates time once started', () => {
    const simulation = createSimulationWithPlayer();

    simulation.startClock(1000);

    expect(simulation.getElapsedMs(5000)).toEqual(4000);
  });

  it('freezes while paused and resumes without counting the gap', () => {
    const simulation = createSimulationWithPlayer();

    simulation.startClock(0);
    simulation.pause(1000);

    expect(simulation.getElapsedMs(5000)).toEqual(1000);

    simulation.resume(9000);

    expect(simulation.getElapsedMs(10000)).toEqual(2000);
  });

  it('ignores repeated startClock calls', () => {
    const simulation = createSimulationWithPlayer();

    simulation.startClock(0);
    simulation.startClock(5000);

    expect(simulation.getElapsedMs(6000)).toEqual(6000);
  });

  it('waits for resume when started while paused', () => {
    const simulation = createSimulationWithPlayer();

    simulation.pause(0);
    simulation.startClock(1000);

    expect(simulation.getElapsedMs(2000)).toEqual(0);

    simulation.resume(3000);

    expect(simulation.getElapsedMs(4000)).toEqual(1000);
  });
});

describe('craft collisions', () => {
  it('eliminates both crafts when the player overlaps an enemy', () => {
    const onPlayerEliminated = jest.fn();
    const onEnemyEliminated = jest.fn();
    const simulation = createSimulationWithPlayer({
      top: 100,
      left: 100,
      onEliminated: onPlayerEliminated,
    });

    simulation.addCraft('enemy-1', {
      kind: 'enemy',
      top: 100 + craftSize + 1,
      left: 100,
      facing: 'S',
      isCollidable: true,
      onEliminated: onEnemyEliminated,
    });

    simulation.tick(0);
    expect(onPlayerEliminated).not.toHaveBeenCalled();

    simulation.setSegment(
      'enemy-1',
      {axis: 'top', to: 100, speed: craftSize},
      0,
    );
    simulation.tick(1000);

    expect(onPlayerEliminated).toHaveBeenCalledTimes(1);
    expect(onEnemyEliminated).toHaveBeenCalledTimes(1);

    // Once eliminated, neither craft is collidable again.
    simulation.tick(2000);
    expect(onPlayerEliminated).toHaveBeenCalledTimes(1);
    expect(onEnemyEliminated).toHaveBeenCalledTimes(1);
  });

  it('ignores collisions while the player is not collidable', () => {
    const onPlayerEliminated = jest.fn();
    const simulation = createSimulationWithPlayer({
      top: 100,
      left: 100,
      isCollidable: false,
      onEliminated: onPlayerEliminated,
    });

    simulation.addCraft('enemy-1', {
      kind: 'enemy',
      top: 100,
      left: 100,
      facing: 'S',
      isCollidable: true,
    });

    simulation.tick(0);

    expect(onPlayerEliminated).not.toHaveBeenCalled();
  });
});

describe('missiles', () => {
  it('eliminates an enemy when a player missile reaches it', () => {
    const onEnemyEliminated = jest.fn();
    const onImpact = jest.fn();
    const simulation = createSimulationWithPlayer({top: 500, left: 100});

    simulation.addCraft('enemy-1', {
      kind: 'enemy',
      top: 200,
      left: 100,
      facing: 'S',
      isCollidable: true,
      onEliminated: onEnemyEliminated,
    });

    // Fired facing north: missile top = originTop + value, value decreases.
    simulation.addMissile(
      'player-missile-left',
      {
        ownerId: PLAYER_ID,
        originTop: 500,
        originLeft: 100 - 6,
        facing: 'N',
        positionOffset: 6,
        startValue: 6,
        targetKind: 'enemy',
        onImpact,
      },
      0,
    );

    simulation.tick(1000);
    expect(onEnemyEliminated).not.toHaveBeenCalled();

    // Needs to travel ~286px to enter the enemy box (top 200..220).
    const msToTarget = ((500 + 6 - (200 + craftSize)) / missileSpeed) * 1000;
    simulation.tick(msToTarget + 1);

    expect(onEnemyEliminated).toHaveBeenCalledTimes(1);
    expect(onImpact).toHaveBeenCalledTimes(1);
    expect(simulation.getMissileValue('player-missile-left')).toBeUndefined();
  });

  it('eliminates the player when an enemy missile reaches them', () => {
    const onPlayerEliminated = jest.fn();
    const onImpact = jest.fn();
    const simulation = createSimulationWithPlayer({
      top: 500,
      left: 100,
      onEliminated: onPlayerEliminated,
    });

    simulation.addCraft('enemy-1', {
      kind: 'enemy',
      top: 200,
      left: 100,
      facing: 'S',
      isCollidable: true,
    });

    // Facing south: missile top = originTop + craftSize - value, and value
    // decreases, so the missile travels toward larger tops.
    simulation.addMissile(
      'enemy-1-missile',
      {
        ownerId: 'enemy-1',
        originTop: 200,
        originLeft: 100,
        facing: 'S',
        positionOffset: 10,
        startValue: 12,
        targetKind: 'player',
        onImpact,
      },
      0,
    );

    // Flight time to the middle of the player's box.
    const msToTarget =
      ((500 - 200 - craftSize + 12 + 10) / missileSpeed) * 1000;
    simulation.tick(msToTarget + 1);

    expect(onPlayerEliminated).toHaveBeenCalledTimes(1);
    expect(onImpact).toHaveBeenCalledTimes(1);
  });

  it('pauses missile travel with the simulation clock', () => {
    const simulation = createSimulationWithPlayer();

    simulation.addMissile(
      'player-missile-left',
      {
        ownerId: PLAYER_ID,
        originTop: 500,
        originLeft: 0,
        facing: 'N',
        positionOffset: 6,
        startValue: 10,
        targetKind: 'enemy',
        onImpact: () => {},
      },
      0,
    );

    simulation.pause(1000);
    const valueWhenPaused = simulation.getMissileValue(
      'player-missile-left',
      1000,
    );

    expect(simulation.getMissileValue('player-missile-left', 8000)).toEqual(
      valueWhenPaused,
    );

    simulation.resume(9000);

    expect(simulation.getMissileValue('player-missile-left', 10000)).toEqual(
      (valueWhenPaused ?? 0) - missileSpeed,
    );
  });
});

describe('missile threats', () => {
  function addThreatenedEnemy(
    simulation: Simulation,
    onThreatened: (threat: {facing: string}) => void,
    {
      top = 100,
      left = 100,
      facing = 'S',
    }: {top?: number; left?: number; facing?: Facing} = {},
  ) {
    simulation.addCraft('enemy-1', {
      kind: 'enemy',
      top,
      left,
      facing,
      isCollidable: true,
      onThreatened,
    });
  }

  function addPlayerMissile(
    simulation: Simulation,
    {
      originTop = 500,
      originLeft = 100 - 6,
      targetKind = 'enemy',
    }: {
      originTop?: number;
      originLeft?: number;
      targetKind?: 'player' | 'enemy';
    } = {},
  ) {
    // Fired facing north from below the enemy: missile top = originTop + value.
    simulation.addMissile(
      'player-missile-left',
      {
        ownerId: PLAYER_ID,
        originTop,
        originLeft,
        facing: 'N',
        positionOffset: 6,
        startValue: 6,
        targetKind,
        onImpact: () => {},
      },
      0,
    );
  }

  it('warns a craft once when a missile heads toward it within the window', () => {
    const onThreatened = jest.fn();
    const simulation = createSimulationWithPlayer({top: 500, left: 100});

    addThreatenedEnemy(simulation, onThreatened);
    addPlayerMissile(simulation);

    // ~396px away at t=0: outside the 1s window (110px/s).
    simulation.tick(0);
    expect(onThreatened).not.toHaveBeenCalled();

    // At 2.8s the missile is ~88px away: inside the window.
    simulation.tick(2800);
    expect(onThreatened).toHaveBeenCalledTimes(1);
    expect(onThreatened).toHaveBeenCalledWith({facing: 'N'});

    // The same missile never re-warns the same craft.
    simulation.tick(2900);
    expect(onThreatened).toHaveBeenCalledTimes(1);
  });

  it('ignores missiles heading away from the craft', () => {
    const onThreatened = jest.fn();
    const simulation = createSimulationWithPlayer({top: 500, left: 100});

    // Enemy below the missile origin; a north-bound missile moves away.
    addThreatenedEnemy(simulation, onThreatened, {top: 600, left: 100});
    addPlayerMissile(simulation);

    simulation.tick(0);
    simulation.tick(2500);

    expect(onThreatened).not.toHaveBeenCalled();
  });

  it('ignores missiles approaching from the side', () => {
    const onThreatened = jest.fn();
    const simulation = createSimulationWithPlayer({top: 500, left: 100});

    // Enemy facing east can't see the north-bound missile crossing its alley.
    addThreatenedEnemy(simulation, onThreatened, {facing: 'E'});
    addPlayerMissile(simulation);

    simulation.tick(0);
    simulation.tick(2800);

    expect(onThreatened).not.toHaveBeenCalled();
  });

  it('ignores point-blank missiles that arrive before the reaction minimum', () => {
    const onThreatened = jest.fn();
    const simulation = createSimulationWithPlayer({top: 500, left: 100});

    addThreatenedEnemy(simulation, onThreatened);
    // Missile top starts at 124 + 6 = 130: 20px from the enemy's center,
    // ~181ms of flight time — under the 250ms reaction minimum.
    addPlayerMissile(simulation, {originTop: 124});

    simulation.tick(0);
    simulation.tick(100);

    expect(onThreatened).not.toHaveBeenCalled();
  });

  it('ignores close shots at a craft charging the missile head-on', () => {
    const onThreatened = jest.fn();
    const simulation = createSimulationWithPlayer({top: 500, left: 100});

    addThreatenedEnemy(simulation, onThreatened);
    // Enemy charges south at 150px/s into the north-bound missile: closing
    // speed 260px/s. Missile top starts at 204 + 6 = 210, 100px from the
    // enemy's center: 909ms by missile speed alone, but only ~385ms of true
    // flight time — under the reaction minimum.
    simulation.setSegment('enemy-1', {axis: 'top', to: 400, speed: 150}, 0);
    addPlayerMissile(simulation, {originTop: 204});

    simulation.tick(0);
    simulation.tick(100);

    expect(onThreatened).not.toHaveBeenCalled();
  });

  it('warns a charging craft at distances beyond the missile-only window', () => {
    const onThreatened = jest.fn();
    const simulation = createSimulationWithPlayer({top: 500, left: 100});

    addThreatenedEnemy(simulation, onThreatened);
    // 200px out is 1818ms by missile speed alone (outside the window), but
    // the 260px/s closing speed makes true impact ~769ms away.
    simulation.setSegment('enemy-1', {axis: 'top', to: 400, speed: 150}, 0);
    addPlayerMissile(simulation, {originTop: 304});

    simulation.tick(0);

    expect(onThreatened).toHaveBeenCalledTimes(1);
    expect(onThreatened).toHaveBeenCalledWith({facing: 'N'});
  });

  it('ignores missiles that cannot catch a fleeing craft', () => {
    const onThreatened = jest.fn();
    const simulation = createSimulationWithPlayer({top: 500, left: 100});

    addThreatenedEnemy(simulation, onThreatened, {facing: 'N'});
    // Enemy outruns the missile northward at 150px/s vs 110px/s: the 100px
    // gap (in the window by missile speed alone) only ever grows.
    simulation.setSegment('enemy-1', {axis: 'top', to: 0, speed: 150}, 0);
    addPlayerMissile(simulation, {originTop: 204});

    simulation.tick(0);
    simulation.tick(500);

    expect(onThreatened).not.toHaveBeenCalled();
  });

  it('ignores missiles in a different alley', () => {
    const onThreatened = jest.fn();
    const simulation = createSimulationWithPlayer({top: 500, left: 100});

    addThreatenedEnemy(simulation, onThreatened, {top: 100, left: 300});
    addPlayerMissile(simulation);

    simulation.tick(2500);

    expect(onThreatened).not.toHaveBeenCalled();
  });

  it('ignores enemy-fired missiles', () => {
    const onThreatened = jest.fn();
    const simulation = createSimulationWithPlayer({top: 500, left: 100});

    addThreatenedEnemy(simulation, onThreatened);
    addPlayerMissile(simulation, {targetKind: 'player'});

    simulation.tick(2500);

    expect(onThreatened).not.toHaveBeenCalled();
  });
});

describe('missile queries', () => {
  it('returns positions for missiles of a target kind', () => {
    const simulation = createSimulationWithPlayer({top: 500, left: 100});

    simulation.addMissile(
      'player-missile-left',
      {
        ownerId: PLAYER_ID,
        originTop: 500,
        originLeft: 100 - 6,
        facing: 'N',
        positionOffset: 6,
        startValue: 6,
        targetKind: 'enemy',
        onImpact: () => {},
      },
      0,
    );

    expect(simulation.getMissiles('player', 1000)).toEqual([]);

    const missiles = simulation.getMissiles('enemy', 1000);

    expect(missiles).toHaveLength(1);
    expect(missiles[0].id).toEqual('player-missile-left');
    expect(missiles[0].facing).toEqual('N');
    // After 1s a north-bound missile has travelled missileSpeed px upward.
    expect(missiles[0].position.top).toBeCloseTo(500 + 6 - missileSpeed);
    expect(missiles[0].position.left).toBeCloseTo(100);
  });

  it('mirrors the rendered rotation of the launch container per facing', () => {
    // The local point (positionOffset, startValue) rotated about the center
    // of the craft-sized container, exactly as the Missile component draws
    // the fired missile.
    const originTop = 500;
    const originLeft = 100;
    const positionOffset = 7;
    const startValue = 6;
    const expected = {
      N: {left: originLeft + positionOffset, top: originTop + startValue},
      E: {
        left: originLeft + craftSize - startValue,
        top: originTop + positionOffset,
      },
      S: {
        left: originLeft + craftSize - positionOffset,
        top: originTop + craftSize - startValue,
      },
      W: {
        left: originLeft + startValue,
        top: originTop + craftSize - positionOffset,
      },
    };

    for (const facing of ['N', 'E', 'S', 'W'] as const) {
      const simulation = createSimulationWithPlayer({top: 500, left: 100});

      simulation.addMissile(
        'player-missile-left',
        {
          ownerId: PLAYER_ID,
          originTop,
          originLeft,
          facing,
          positionOffset,
          startValue,
          targetKind: 'enemy',
          onImpact: () => {},
        },
        0,
      );

      const [missile] = simulation.getMissiles('enemy', 0);

      expect(missile.position.left).toBeCloseTo(expected[facing].left);
      expect(missile.position.top).toBeCloseTo(expected[facing].top);
    }
  });

  it('registers a backward shot on an enemy behind the player', () => {
    const onEliminated = jest.fn();
    const simulation = createSimulationWithPlayer({top: 500, left: 100});

    // Enemy directly south of the player in the same column; the player's
    // left missile (offset 6.9) fired south must land inside its box.
    simulation.addCraft('enemy-1', {
      kind: 'enemy',
      top: 600,
      left: 100,
      facing: 'N',
      isCollidable: true,
      onEliminated,
    });

    simulation.addMissile(
      'player-missile-left',
      {
        ownerId: PLAYER_ID,
        originTop: 500,
        originLeft: 100,
        facing: 'S',
        positionOffset: 6.9,
        startValue: 6,
        targetKind: 'enemy',
        onImpact: () => {},
      },
      0,
    );

    simulation.tick(0);
    expect(onEliminated).not.toHaveBeenCalled();

    // At 900ms the missile is ~613px down: inside the enemy's box.
    simulation.tick(900);
    expect(onEliminated).toHaveBeenCalledTimes(1);
  });
});

describe('items', () => {
  it('lets a collidable craft pick up an item and removes it', () => {
    const onPickedUp = jest.fn();
    const simulation = createSimulationWithPlayer({top: 500, left: 0});

    simulation.addItem('item-0', {
      kind: 'shield',
      top: 400,
      left: 0,
      onPickedUp,
    });

    simulation.tick(0);
    expect(onPickedUp).not.toHaveBeenCalled();

    simulation.setSegment(PLAYER_ID, {axis: 'top', to: 300, speed: 50}, 0);
    simulation.tick(2000);

    expect(onPickedUp).toHaveBeenCalledTimes(1);
    expect(onPickedUp).toHaveBeenCalledWith(PLAYER_ID);
    expect(simulation.getItems()).toEqual([]);

    simulation.tick(2100);
    expect(onPickedUp).toHaveBeenCalledTimes(1);
  });

  it('ignores crafts that are not collidable', () => {
    const onPickedUp = jest.fn();
    const simulation = createSimulationWithPlayer({
      top: 400,
      left: 0,
      isCollidable: false,
    });

    simulation.addItem('item-0', {
      kind: 'cloak',
      top: 400,
      left: 0,
      onPickedUp,
    });

    simulation.tick(0);

    expect(onPickedUp).not.toHaveBeenCalled();
  });
});

describe('shields', () => {
  it('absorbs one missile from behind', () => {
    const onConsumed = jest.fn();
    const onPlayerEliminated = jest.fn();
    const onImpact = jest.fn();
    // Facing north; the shield trails below, so a north-bound missile fired
    // from behind reaches the shield box (top 320..340) first.
    const simulation = createSimulationWithPlayer({
      top: 300,
      left: 100,
      onEliminated: onPlayerEliminated,
    });

    simulation.setShielded(PLAYER_ID, true, onConsumed);
    simulation.addMissile(
      'enemy-1-missile',
      {
        ownerId: 'enemy-1',
        originTop: 500,
        originLeft: 100 - 6,
        facing: 'N',
        positionOffset: 6,
        startValue: 6,
        targetKind: 'player',
        onImpact,
      },
      0,
    );

    simulation.tick(1000);
    expect(onConsumed).not.toHaveBeenCalled();

    // At 1.55s the missile is at top ~335: inside the shield box.
    simulation.tick(1550);

    expect(onConsumed).toHaveBeenCalledTimes(1);
    expect(onImpact).toHaveBeenCalledTimes(1);
    expect(onPlayerEliminated).not.toHaveBeenCalled();
    expect(simulation.getMissileValue('enemy-1-missile')).toBeUndefined();
  });

  it('does not stop a frontal missile', () => {
    const onConsumed = jest.fn();
    const onPlayerEliminated = jest.fn();
    // Facing north with a south-bound missile approaching head-on.
    const simulation = createSimulationWithPlayer({
      top: 300,
      left: 100,
      onEliminated: onPlayerEliminated,
    });

    simulation.setShielded(PLAYER_ID, true, onConsumed);
    simulation.addMissile(
      'enemy-1-missile',
      {
        ownerId: 'enemy-1',
        originTop: 100,
        originLeft: 100,
        facing: 'S',
        positionOffset: 10,
        startValue: 6,
        targetKind: 'player',
        onImpact: () => {},
      },
      0,
    );

    // At 1.8s the missile is at top ~312: inside the player box, which sits
    // in front of the trailing shield box.
    simulation.tick(1800);

    expect(onPlayerEliminated).toHaveBeenCalledTimes(1);
    expect(onConsumed).not.toHaveBeenCalled();
  });

  it('absorbs a rear ram, eliminating only the attacker', () => {
    const onConsumed = jest.fn();
    const onPlayerEliminated = jest.fn();
    const onEnemyEliminated = jest.fn();
    const simulation = createSimulationWithPlayer({
      top: 300,
      left: 100,
      onEliminated: onPlayerEliminated,
    });

    simulation.setShielded(PLAYER_ID, true, onConsumed);
    simulation.addCraft('enemy-1', {
      kind: 'enemy',
      top: 360,
      left: 100,
      facing: 'N',
      isCollidable: true,
      onEliminated: onEnemyEliminated,
    });

    simulation.tick(0);
    expect(onEnemyEliminated).not.toHaveBeenCalled();

    // The enemy chases into the shield box (top 320..340) from behind.
    simulation.setSegment('enemy-1', {axis: 'top', to: 300, speed: 20}, 0);
    simulation.tick(1200);

    expect(onEnemyEliminated).toHaveBeenCalledTimes(1);
    expect(onConsumed).toHaveBeenCalledTimes(1);
    expect(onPlayerEliminated).not.toHaveBeenCalled();
  });
});

describe('cloak', () => {
  it('hides the player from line of sight until it expires', () => {
    const onLineOfSightChange = jest.fn();
    const onEnded = jest.fn();
    const simulation = createSimulationWithPlayer({top: 500, left: 100});

    simulation.addCraft('enemy-1', {
      kind: 'enemy',
      top: 200,
      left: 100,
      facing: 'S',
      isCollidable: true,
      onLineOfSightChange,
    });

    simulation.setCloaked(PLAYER_ID, 30000, onEnded, 0);

    simulation.tick(0);
    simulation.tick(29999);
    expect(onLineOfSightChange).not.toHaveBeenCalled();
    expect(onEnded).not.toHaveBeenCalled();

    simulation.tick(30000);

    expect(onEnded).toHaveBeenCalledTimes(1);
    expect(onLineOfSightChange).toHaveBeenCalledWith(true);
  });

  it('does not tick down while paused', () => {
    const onEnded = jest.fn();
    const simulation = createSimulationWithPlayer({top: 500, left: 100});

    simulation.setCloaked(PLAYER_ID, 30000, onEnded, 0);
    simulation.pause(10000);
    simulation.resume(50000);

    simulation.tick(60000);
    expect(onEnded).not.toHaveBeenCalled();

    // 10s before the pause + 20s after = the full 30s of active time.
    simulation.tick(70000);
    expect(onEnded).toHaveBeenCalledTimes(1);
  });
});

describe('item effect snapshots', () => {
  it('returns no effects for an unknown craft', () => {
    const simulation = createSimulationWithPlayer({top: 500, left: 100});

    expect(simulation.getItemEffects('missing-craft')).toEqual({
      hasShield: false,
      cloakRemainingMs: 0,
      clusterBombCount: 0,
    });
  });

  it('captures a shield and stockpiled cluster bombs', () => {
    const simulation = createSimulationWithPlayer({top: 500, left: 100});

    simulation.setShielded(PLAYER_ID, true);
    simulation.armClusterBomb(PLAYER_ID);
    simulation.armClusterBomb(PLAYER_ID);

    expect(simulation.getItemEffects(PLAYER_ID)).toEqual({
      hasShield: true,
      cloakRemainingMs: 0,
      clusterBombCount: 2,
    });
  });

  it('reports the cloak time left at the moment of the snapshot', () => {
    const simulation = createSimulationWithPlayer({top: 500, left: 100});

    simulation.setCloaked(PLAYER_ID, 30000, undefined, 0);

    expect(simulation.getItemEffects(PLAYER_ID, 12000).cloakRemainingMs).toBe(
      18000,
    );
  });

  it('does not burn cloak time while paused', () => {
    const simulation = createSimulationWithPlayer({top: 500, left: 100});

    simulation.setCloaked(PLAYER_ID, 30000, undefined, 0);
    simulation.pause(10000);

    expect(simulation.getItemEffects(PLAYER_ID, 60000).cloakRemainingMs).toBe(
      20000,
    );
  });
});

describe('cluster bombs', () => {
  it('pierces every craft in the line of fire', () => {
    const onCountChange = jest.fn();
    const onImpact = jest.fn();
    const onFirstEliminated = jest.fn();
    const onSecondEliminated = jest.fn();
    const simulation = createSimulationWithPlayer({top: 500, left: 100});

    simulation.addCraft('enemy-1', {
      kind: 'enemy',
      top: 300,
      left: 100,
      facing: 'S',
      isCollidable: true,
      onEliminated: onFirstEliminated,
    });
    simulation.addCraft('enemy-2', {
      kind: 'enemy',
      top: 200,
      left: 100,
      facing: 'S',
      isCollidable: true,
      onEliminated: onSecondEliminated,
    });

    simulation.armClusterBomb(PLAYER_ID, onCountChange);
    expect(onCountChange).toHaveBeenLastCalledWith(1);

    simulation.addMissile(
      'player-missile-cluster',
      {
        ownerId: PLAYER_ID,
        originTop: 500,
        originLeft: 100 - 6,
        facing: 'N',
        positionOffset: 6,
        startValue: 6,
        targetKind: 'enemy',
        isClusterBomb: true,
        onImpact,
      },
      0,
    );

    // Firing spends the bomb.
    expect(onCountChange).toHaveBeenLastCalledWith(0);

    simulation.tick(1700);
    expect(onFirstEliminated).toHaveBeenCalledTimes(1);
    expect(onSecondEliminated).not.toHaveBeenCalled();
    // The piercing missile flies on instead of detonating.
    expect(onImpact).not.toHaveBeenCalled();
    expect(simulation.getMissileValue('player-missile-cluster')).toBeDefined();

    simulation.tick(2700);
    expect(onSecondEliminated).toHaveBeenCalledTimes(1);
    expect(onImpact).not.toHaveBeenCalled();
    expect(simulation.getMissileValue('player-missile-cluster')).toBeDefined();
  });

  it('is not consumed by a regular missile', () => {
    const onCountChange = jest.fn();
    const onImpact = jest.fn();
    const onFirstEliminated = jest.fn();
    const onSecondEliminated = jest.fn();
    const simulation = createSimulationWithPlayer({top: 500, left: 100});

    simulation.addCraft('enemy-1', {
      kind: 'enemy',
      top: 300,
      left: 100,
      facing: 'S',
      isCollidable: true,
      onEliminated: onFirstEliminated,
    });
    simulation.addCraft('enemy-2', {
      kind: 'enemy',
      top: 200,
      left: 100,
      facing: 'S',
      isCollidable: true,
      onEliminated: onSecondEliminated,
    });

    simulation.armClusterBomb(PLAYER_ID, onCountChange);
    simulation.addMissile(
      'player-missile-left',
      {
        ownerId: PLAYER_ID,
        originTop: 500,
        originLeft: 100 - 6,
        facing: 'N',
        positionOffset: 6,
        startValue: 6,
        targetKind: 'enemy',
        onImpact,
      },
      0,
    );

    // The bomb stays armed (count unchanged since the arm), and the regular
    // missile detonates on the first enemy instead of piercing.
    expect(onCountChange).toHaveBeenCalledTimes(1);
    expect(onCountChange).toHaveBeenLastCalledWith(1);
    simulation.tick(1700);
    expect(onFirstEliminated).toHaveBeenCalledTimes(1);
    expect(onImpact).toHaveBeenCalledTimes(1);
    expect(simulation.getMissileValue('player-missile-left')).toBeUndefined();
    expect(onSecondEliminated).not.toHaveBeenCalled();
    expect(onCountChange).toHaveBeenLastCalledWith(1);

    // The dedicated cluster missile then spends the bomb.
    simulation.addMissile(
      'player-missile-cluster',
      {
        ownerId: PLAYER_ID,
        originTop: 500,
        originLeft: 100 - 6,
        facing: 'N',
        positionOffset: 6,
        startValue: 6,
        targetKind: 'enemy',
        isClusterBomb: true,
        onImpact: () => {},
      },
      1700,
    );

    expect(onCountChange).toHaveBeenLastCalledWith(0);
  });

  it('stockpiles bombs and spends one per shot', () => {
    const onCountChange = jest.fn();
    const simulation = createSimulationWithPlayer({top: 500, left: 100});

    simulation.armClusterBomb(PLAYER_ID, onCountChange);
    simulation.armClusterBomb(PLAYER_ID, onCountChange);
    simulation.armClusterBomb(PLAYER_ID, onCountChange);
    expect(onCountChange).toHaveBeenLastCalledWith(3);

    const fireCluster = (id: string, now: number) =>
      simulation.addMissile(
        id,
        {
          ownerId: PLAYER_ID,
          originTop: 500,
          originLeft: 100 - 6,
          facing: 'N',
          positionOffset: 6,
          startValue: 6,
          targetKind: 'enemy',
          isClusterBomb: true,
          onImpact: () => {},
        },
        now,
      );

    fireCluster('cluster-a', 0);
    expect(onCountChange).toHaveBeenLastCalledWith(2);
    fireCluster('cluster-b', 1);
    expect(onCountChange).toHaveBeenLastCalledWith(1);
    fireCluster('cluster-c', 2);
    expect(onCountChange).toHaveBeenLastCalledWith(0);

    // With the stockpile empty, a further cluster shot changes nothing.
    fireCluster('cluster-d', 3);
    expect(onCountChange).toHaveBeenLastCalledWith(0);
    expect(onCountChange).toHaveBeenCalledTimes(6);
  });

  it('lets an enemy fire a picked-up bomb at the player', () => {
    const onCountChange = jest.fn();
    const onImpact = jest.fn();
    const onPlayerEliminated = jest.fn();
    const simulation = createSimulationWithPlayer({
      top: 500,
      left: 100,
      onEliminated: onPlayerEliminated,
    });

    simulation.addCraft('enemy-1', {
      kind: 'enemy',
      top: 200,
      left: 100,
      facing: 'S',
      isCollidable: true,
    });

    simulation.armClusterBomb('enemy-1', onCountChange);

    // Facing south: missile top = originTop + craftSize - value, and value
    // decreases, so the missile travels toward larger tops.
    simulation.addMissile(
      'enemy-1-cluster-missile',
      {
        ownerId: 'enemy-1',
        originTop: 200,
        originLeft: 100,
        facing: 'S',
        positionOffset: 10,
        startValue: 12,
        targetKind: 'player',
        isClusterBomb: true,
        onImpact,
      },
      0,
    );

    expect(onCountChange).toHaveBeenLastCalledWith(0);

    // Flight time to the middle of the player's box.
    const msToTarget =
      ((500 - 200 - craftSize + 12 + 10) / missileSpeed) * 1000;
    simulation.tick(msToTarget + 1);

    expect(onPlayerEliminated).toHaveBeenCalledTimes(1);
    expect(onImpact).toHaveBeenCalledTimes(1);
  });

  it('is stopped by a rear shield', () => {
    const onConsumed = jest.fn();
    const onEnemyEliminated = jest.fn();
    const simulation = createSimulationWithPlayer({top: 500, left: 100});

    // Facing north, so its shield trails south toward the incoming missile.
    simulation.addCraft('enemy-1', {
      kind: 'enemy',
      top: 200,
      left: 100,
      facing: 'N',
      isCollidable: true,
      onEliminated: onEnemyEliminated,
    });

    simulation.setShielded('enemy-1', true, onConsumed);
    simulation.armClusterBomb(PLAYER_ID);
    simulation.addMissile(
      'player-missile-cluster',
      {
        ownerId: PLAYER_ID,
        originTop: 500,
        originLeft: 100 - 6,
        facing: 'N',
        positionOffset: 6,
        startValue: 6,
        targetKind: 'enemy',
        isClusterBomb: true,
        onImpact: () => {},
      },
      0,
    );

    // At 2.5s the missile is at top ~231: inside the shield box (220..240).
    simulation.tick(2500);

    expect(onConsumed).toHaveBeenCalledTimes(1);
    expect(onEnemyEliminated).not.toHaveBeenCalled();
    expect(
      simulation.getMissileValue('player-missile-cluster'),
    ).toBeUndefined();
  });
});

describe('line of sight', () => {
  it('notifies an enemy when the player enters and leaves its line of sight', () => {
    const onLineOfSightChange = jest.fn();
    const simulation = createSimulationWithPlayer({top: 500, left: 100});

    simulation.addCraft('enemy-1', {
      kind: 'enemy',
      top: 200,
      left: 100,
      facing: 'S',
      isCollidable: true,
      onLineOfSightChange,
    });

    simulation.tick(0);
    expect(onLineOfSightChange).toHaveBeenCalledWith(true);

    simulation.setFacing('enemy-1', 'N');
    simulation.tick(100);
    expect(onLineOfSightChange).toHaveBeenLastCalledWith(false);
    expect(onLineOfSightChange).toHaveBeenCalledTimes(2);
  });

  it('does not report line of sight before the player has moved', () => {
    const onLineOfSightChange = jest.fn();
    const simulation = createSimulationWithPlayer({
      top: 500,
      left: 100,
      isCollidable: false,
    });

    simulation.addCraft('enemy-1', {
      kind: 'enemy',
      top: 200,
      left: 100,
      facing: 'S',
      isCollidable: true,
      onLineOfSightChange,
    });

    simulation.tick(0);

    expect(onLineOfSightChange).not.toHaveBeenCalled();
  });
});

describe('commander alert', () => {
  it('alerts every other enemy with the player position when a commander spots the player', () => {
    const commanderAlert = jest.fn();
    const otherAlert = jest.fn();
    const simulation = createSimulationWithPlayer({top: 500, left: 100});

    simulation.addCraft('enemy-commander', {
      kind: 'enemy',
      top: 200,
      left: 100,
      facing: 'S',
      isCollidable: true,
      isCommander: true,
      onLineOfSightChange: () => {},
      onCommanderAlert: commanderAlert,
    });
    simulation.addCraft('enemy-2', {
      kind: 'enemy',
      top: 800,
      left: 700,
      facing: 'N',
      isCollidable: true,
      onCommanderAlert: otherAlert,
    });

    simulation.tick(0);

    expect(otherAlert).toHaveBeenCalledWith({top: 500, left: 100});
    // A commander never alerts itself.
    expect(commanderAlert).not.toHaveBeenCalled();
  });

  it('alerts only once per acquisition, not every tick the player stays in sight', () => {
    const otherAlert = jest.fn();
    const simulation = createSimulationWithPlayer({top: 500, left: 100});

    simulation.addCraft('enemy-commander', {
      kind: 'enemy',
      top: 200,
      left: 100,
      facing: 'S',
      isCollidable: true,
      isCommander: true,
      onLineOfSightChange: () => {},
      onCommanderAlert: () => {},
    });
    simulation.addCraft('enemy-2', {
      kind: 'enemy',
      top: 800,
      left: 700,
      facing: 'N',
      isCollidable: true,
      onCommanderAlert: otherAlert,
    });

    simulation.tick(0);
    simulation.tick(100);

    expect(otherAlert).toHaveBeenCalledTimes(1);
  });

  it('does not alert the board when a non-commander spots the player', () => {
    const otherAlert = jest.fn();
    const simulation = createSimulationWithPlayer({top: 500, left: 100});

    simulation.addCraft('enemy-1', {
      kind: 'enemy',
      top: 200,
      left: 100,
      facing: 'S',
      isCollidable: true,
      onLineOfSightChange: () => {},
      onCommanderAlert: () => {},
    });
    simulation.addCraft('enemy-2', {
      kind: 'enemy',
      top: 800,
      left: 700,
      facing: 'N',
      isCollidable: true,
      onCommanderAlert: otherAlert,
    });

    simulation.tick(0);

    expect(otherAlert).not.toHaveBeenCalled();
  });
});
