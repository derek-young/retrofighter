import React, {useCallback, useContext, useState} from 'react';

import {useGameContext} from 'Game/GameContext';
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
  const {resetAnimationContext} = useAnimationContext();
  const [isPlayerEliminated, setIsPlayerEliminated] = useState(false);
  const [hasEliminationAnimationEnded, setHasEliminationAnimationEnded] =
    useState(false);

  const onIsPlayerEliminated = useCallback(() => {
    setIsPlayerEliminated(true);
  }, []);

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

  return (
    <EliminationContext.Provider
      children={children}
      value={{
        onIsPlayerEliminated,
        hasEliminationAnimationEnded,
        isPlayerEliminated,
        onEliminationEnd,
        resetEliminationContext,
        shouldRenderPlayer: !(
          isPlayerEliminated && hasEliminationAnimationEnded
        ),
      }}
    />
  );
};
