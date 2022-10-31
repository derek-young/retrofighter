import React, {useCallback, useContext, useState} from 'react';

import {useAnimationContext} from './AnimationContext';

type EliminationContextValue = {
  onIsPlayerEliminated: () => void;
  hasEliminationAnimationEnded: boolean;
  isPlayerEliminated: boolean;
  onEliminationEnd: () => void;
  remainingLives: number;
  resetEliminationContext: () => void;
  shouldRenderPlayer: boolean;
};

const noop = () => {};

const defaultValue: EliminationContextValue = {
  onIsPlayerEliminated: noop,
  hasEliminationAnimationEnded: false,
  isPlayerEliminated: false,
  onEliminationEnd: noop,
  remainingLives: 3,
  resetEliminationContext: noop,
  shouldRenderPlayer: false,
};

const EliminationContext = React.createContext(defaultValue);

export const useEliminationContext = () => useContext(EliminationContext);

export const EliminationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const {resetAnimationContext} = useAnimationContext();
  const [isPlayerEliminated, setIsPlayerEliminated] = useState(false);
  const [hasEliminationAnimationEnded, setHasEliminationAnimationEnded] =
    useState(false);
  const [remainingLives, setRemainingLives] = useState(3);

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
        setRemainingLives(l => l - 1);
        resetAnimationContext();
        resetEliminationContext();
      }, 1000);
    }
  }, [remainingLives, resetAnimationContext, resetEliminationContext]);

  return (
    <EliminationContext.Provider
      children={children}
      value={{
        onIsPlayerEliminated,
        hasEliminationAnimationEnded,
        isPlayerEliminated,
        onEliminationEnd,
        remainingLives,
        resetEliminationContext,
        shouldRenderPlayer: !(
          isPlayerEliminated && hasEliminationAnimationEnded
        ),
      }}
    />
  );
};
