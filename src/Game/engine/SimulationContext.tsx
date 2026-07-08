import React, {useContext, useEffect, useRef} from 'react';

import {
  playerStartLeft,
  playerStartTop,
  defaultPlayerFacing,
} from 'Game/constants';
import {useGameContext} from 'Game/GameContext';

import Simulation, {PLAYER_ID} from './Simulation';

const SimulationContext = React.createContext<null | Simulation>(null);

export function useSimulationContext(): Simulation {
  const simulation = useContext(SimulationContext);

  if (!simulation) {
    throw new Error(
      'useSimulationContext must be used within a SimulationProvider',
    );
  }

  return simulation;
}

interface SimulationProviderProps {
  children: React.ReactNode;
}

function createSimulation() {
  const simulation = new Simulation();

  // Register the player synchronously so child providers can attach
  // callbacks and flags from their effects in any order.
  simulation.addCraft(PLAYER_ID, {
    kind: 'player',
    top: playerStartTop,
    left: playerStartLeft,
    facing: defaultPlayerFacing,
    isCollidable: false,
  });

  return simulation;
}

export function SimulationProvider({children}: SimulationProviderProps) {
  const {isPaused} = useGameContext();
  const simulationRef = useRef<null | Simulation>(null);

  if (simulationRef.current === null) {
    simulationRef.current = createSimulation();
  }

  const simulation = simulationRef.current;

  useEffect(() => {
    simulation.start();

    return () => simulation.destroy();
  }, [simulation]);

  useEffect(() => {
    if (isPaused) {
      simulation.pause();
    } else {
      simulation.resume();
    }
  }, [isPaused, simulation]);

  return (
    <SimulationContext.Provider value={simulation}>
      {children}
    </SimulationContext.Provider>
  );
}
