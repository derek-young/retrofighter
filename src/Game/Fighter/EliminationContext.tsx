import React, {useCallback, useContext, useState} from 'react';

import {useAnimationContext} from './AnimationContext';

type EliminationContextValue = {
  handleIsElimnated: () => void;
  hasEliminationAnimationEnded: boolean;
  isEliminated: boolean;
  onEliminationEnd: () => void;
  resetEliminationContext: () => void;
};

const noop = () => {};

const defaultValue: EliminationContextValue = {
  handleIsElimnated: noop,
  hasEliminationAnimationEnded: false,
  isEliminated: false,
  onEliminationEnd: noop,
  resetEliminationContext: noop,
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

  const handleIsElimnated = useCallback(() => {
    setIsEliminated(true);
  }, []);

  const onEliminationEnd = useCallback(() => {
    setHasEliminationAnimationEnded(true);
    resetAnimationContext();
  }, [resetAnimationContext]);

  const resetEliminationContext = useCallback(() => {
    setIsEliminated(false);
    setHasEliminationAnimationEnded(false);
  }, []);

  return (
    <EliminationContext.Provider
      children={children}
      value={{
        handleIsElimnated,
        hasEliminationAnimationEnded,
        isEliminated,
        onEliminationEnd,
        resetEliminationContext,
      }}
    />
  );
};
