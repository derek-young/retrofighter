import React, {useCallback, useContext, useState} from 'react';

import {useAnimationContext} from './AnimationContext';

type EliminationContextValue = {
  hasEliminationAnimationEnded: boolean;
  isEliminated: boolean;
  onEliminationEnd: () => void;
  resetEliminationContext: () => void;
  setIsEliminated: (isEliminated: boolean) => void;
};

const noop = () => {};

const defaultValue: EliminationContextValue = {
  hasEliminationAnimationEnded: false,
  isEliminated: false,
  onEliminationEnd: noop,
  resetEliminationContext: noop,
  setIsEliminated: noop,
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

  const resetEliminationContext = useCallback(() => {
    setIsEliminated(false);
    setHasEliminationAnimationEnded(false);
    resetAnimationContext();
  }, [resetAnimationContext]);

  return (
    <EliminationContext.Provider
      children={children}
      value={{
        hasEliminationAnimationEnded,
        isEliminated,
        onEliminationEnd: () => setHasEliminationAnimationEnded(true),
        resetEliminationContext,
        setIsEliminated,
      }}
    />
  );
};
