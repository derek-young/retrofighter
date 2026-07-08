import {alleyWidth, craftSize, missileSpeed} from 'Game/constants';

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

    // Facing south: missile top = originTop - value, value decreases, so the
    // missile travels toward larger tops.
    simulation.addMissile(
      'enemy-1-missile',
      {
        ownerId: 'enemy-1',
        originTop: 200,
        originLeft: 100 - alleyWidth + 10,
        facing: 'S',
        positionOffset: 10,
        startValue: 12,
        targetKind: 'player',
        onImpact,
      },
      0,
    );

    const msToTarget = ((500 - 200 + 12) / missileSpeed) * 1000;
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
    {top = 100, left = 100} = {},
  ) {
    simulation.addCraft('enemy-1', {
      kind: 'enemy',
      top,
      left,
      facing: 'S',
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
        originLeft: 100 - alleyWidth + 10,
        facing: 'S',
        positionOffset: 10,
        startValue: 6,
        targetKind: 'player',
        onImpact: () => {},
      },
      0,
    );

    // At 2s the missile is at top ~314: inside the player box, which sits in
    // front of the trailing shield box.
    simulation.tick(2000);

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

describe('cluster bombs', () => {
  it('arms the next missile to pierce every craft in the line of fire', () => {
    const onFired = jest.fn();
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

    simulation.armClusterBomb(PLAYER_ID, onFired);
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

    expect(onFired).toHaveBeenCalledTimes(1);

    simulation.tick(1700);
    expect(onFirstEliminated).toHaveBeenCalledTimes(1);
    expect(onSecondEliminated).not.toHaveBeenCalled();
    // The piercing missile flies on instead of detonating.
    expect(onImpact).not.toHaveBeenCalled();
    expect(simulation.getMissileValue('player-missile-left')).toBeDefined();

    simulation.tick(2700);
    expect(onSecondEliminated).toHaveBeenCalledTimes(1);
    expect(onImpact).not.toHaveBeenCalled();
    expect(simulation.getMissileValue('player-missile-left')).toBeDefined();
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

    // At 2.5s the missile is at top ~231: inside the shield box (220..240).
    simulation.tick(2500);

    expect(onConsumed).toHaveBeenCalledTimes(1);
    expect(onEnemyEliminated).not.toHaveBeenCalled();
    expect(simulation.getMissileValue('player-missile-left')).toBeUndefined();
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
