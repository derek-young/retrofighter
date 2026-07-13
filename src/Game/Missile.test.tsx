import React from 'react';
import {Animated, StyleSheet} from 'react-native';
import TestRenderer, {act} from 'react-test-renderer';

import {missileSize} from 'Game/constants';

jest.mock('./engine/SimulationContext', () => ({
  useSimulationContext: () => ({
    getPosition: () => null,
    addMissile: () => {},
    removeMissile: () => {},
    getMissileValue: () => undefined,
  }),
}));

jest.mock('./GameContext', () => ({
  useGameContext: () => ({isPaused: false}),
}));

import Missile from './Missile';

const startingTop = missileSize / 2;

const Icon = () => null;

function renderMissile(hasMissileFired: boolean, missileAnimValue = startingTop) {
  const props = {
    facing: 'N' as const,
    Icon,
    leftAnim: new Animated.Value(0),
    topAnim: new Animated.Value(0),
    missileId: 'test-missile',
    missileProps: {
      hasMissileFired,
      missileAnim: new Animated.Value(missileAnimValue),
      onFireAnimationEnded: jest.fn(),
      onFireMissile: jest.fn(),
      startingTop,
    },
    ownerId: 'player',
    positionOffset: 6,
    rotationAnim: new Animated.Value(0),
    targetKind: 'enemy' as const,
  };

  let renderer!: TestRenderer.ReactTestRenderer;
  act(() => {
    renderer = TestRenderer.create(<Missile {...props} />);
  });
  return renderer;
}

// The inner travel view is the only view whose transform is a single
// translateY entry (the outer launch container carries three).
function travelTranslateY(renderer: TestRenderer.ReactTestRenderer) {
  const travelView = renderer.root.findAll(node => {
    // Host views only, so each element is counted once (not also as its
    // Animated composite wrapper).
    if (typeof node.type !== 'string') {
      return false;
    }

    const style = StyleSheet.flatten(node.props.style);
    return (
      Array.isArray(style?.transform) &&
      style.transform.length === 1 &&
      'translateY' in style.transform[0]
    );
  });

  expect(travelView).toHaveLength(1);
  return StyleSheet.flatten(travelView[0].props.style).transform[0].translateY;
}

describe('Missile', () => {
  it('docks the missile at a static side offset, not the travel value', () => {
    const renderer = renderMissile(false);

    // A plain number equal to startingTop, never the shared missileAnim value.
    expect(travelTranslateY(renderer)).toBe(startingTop);
  });

  it('keeps the docked missile at its side even when missileAnim holds a frozen mid-flight value', () => {
    // Reproduces the bug: after an impact, stopAnimation() leaves missileAnim
    // far out in front of the craft (a large negative travel value). The
    // docked view must ignore it and stay pinned at the craft's side, rather
    // than carrying the missile out in front until the next fire.
    const frozenMidFlight = -300;
    const renderer = renderMissile(false, frozenMidFlight);

    expect(travelTranslateY(renderer)).toBe(startingTop);
  });
});
