import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {useGameContext} from 'Game/GameContext';
import {PLAYER_ID} from 'Game/engine/Simulation';
import {useSimulationContext} from 'Game/engine/SimulationContext';

import {useAnimationContext} from './AnimationContext';

type EliminationContextValue = {
  onIsPlayerEliminated: () => void;
  hasEliminationAnimationEnded: boolean;
  isPlayerEliminated: boolean;
  onEliminationEnd: () => void;
  resetEliminationContext: () => void;
  shouldRenderPlayer: boolean;
};

const noop = () => {};

const defaultValue: EliminationContextValue = {
  onIsPlayerEliminated: noop,
  hasEliminationAnimationEnded: false,
  isPlayerEliminated: false,
  onEliminationEnd: noop,
  resetEliminationContext: noop,
  shouldRenderPlayer: false,
};

const EliminationContext = React.createContext(defaultValue);

export const useEliminationContext = () => useContext(EliminationContext);

interface EliminationProviderProps {
  children: React.ReactNode;
}

export const EliminationProvider = ({children}: EliminationProviderProps) => {
  const {remainingLives, setRemainingLives} = useGameContext();
  const simulation = useSimulationContext();
  const {resetAnimationContext} = useAnimationContext();
  const [isPlayerEliminated, setIsPlayerEliminated] = useState(false);
  const [hasEliminationAnimationEnded, setHasEliminationAnimationEnded] =
    useState(false);

  const onIsPlayerEliminated = useCallback(() => {
    setIsPlayerEliminated(true);
  }, []);

  useEffect(() => {
    simulation.setCraftCallbacks(PLAYER_ID, {
      onEliminated: onIsPlayerEliminated,
    });
  }, [onIsPlayerEliminated, simulation]);

  const resetEliminationContext = useCallback(() => {
    setIsPlayerEliminated(false);
    setHasEliminationAnimationEnded(false);
  }, []);

  const onEliminationEnd = useCallback(() => {
    setHasEliminationAnimationEnded(true);

    if (remainingLives > 0) {
      setTimeout(() => {
        resetAnimationContext();
        resetEliminationContext();
      }, 1000);
    }

    setRemainingLives(l => l - 1);
  }, [
    remainingLives,
    setRemainingLives,
    resetAnimationContext,
    resetEliminationContext,
  ]);

  const value = useMemo(
    () => ({
      onIsPlayerEliminated,
      hasEliminationAnimationEnded,
      isPlayerEliminated,
      onEliminationEnd,
      resetEliminationContext,
      shouldRenderPlayer: !(isPlayerEliminated && hasEliminationAnimationEnded),
    }),
    [
      onIsPlayerEliminated,
      hasEliminationAnimationEnded,
      isPlayerEliminated,
      onEliminationEnd,
      resetEliminationContext,
    ],
  );

  return (
    <EliminationContext.Provider value={value}>
      {children}
    </EliminationContext.Provider>
  );
};
