import {alleyWidth, craftSize, missileSpeed} from 'Game/constants';

import Simulation, {PLAYER_ID} from './Simulation';

function createSimulationWithPlayer({
  top = 500,
  left = 0,
  isCollidable = true,
  onEliminated = () => {},
} = {}) {
  const simulation = new Simulation();

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
