import React, {useCallback, useContext, useState} from 'react';

import {useAnimationContext} from './AnimationContext';

type EliminationContextValue = {
  handleIsPlayerEliminated: () => void;
  hasEliminationAnimationEnded: boolean;
  isEliminated: boolean;
  onEliminationEnd: () => void;
  remainingLives: number;
  resetEliminationContext: () => void;
  shouldRenderPlayer: boolean;
};

const noop = () => {};

const defaultValue: EliminationContextValue = {
  handleIsPlayerEliminated: noop,
  hasEliminationAnimationEnded: false,
  isEliminated: false,
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
  const [isEliminated, setIsEliminated] = useState(false);
  const [hasEliminationAnimationEnded, setHasEliminationAnimationEnded] =
    useState(false);
  const [remainingLives, setRemainingLives] = useState(3);

  const handleIsPlayerEliminated = useCallback(() => {
    setIsEliminated(true);
  }, []);

  const resetEliminationContext = useCallback(() => {
    setIsEliminated(false);
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
        handleIsPlayerEliminated,
        hasEliminationAnimationEnded,
        isEliminated,
        onEliminationEnd,
        remainingLives,
        resetEliminationContext,
        shouldRenderPlayer: !(isEliminated && hasEliminationAnimationEnded),
      }}
    />
  );
};
