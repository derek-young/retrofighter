import React, {useCallback, useContext, useEffect, useState} from 'react';

type EliminationContextValue = {
  hasEliminationAnimationEnded: boolean;
  isEliminated: boolean;
  onEliminationEnd: () => void;
  resetEliminationContext: () => void;
};

const noop = () => {};

const defaultValue: EliminationContextValue = {
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
  const [isEliminated, setIsEliminated] = useState(false);
  const [hasEliminationAnimationEnded, setHasEliminationAnimationEnded] =
    useState(false);

  useEffect(() => {
    setTimeout(() => setIsEliminated(true), 5000);
  }, []);

  const resetEliminationContext = useCallback(() => {
    setIsEliminated(false);
    setHasEliminationAnimationEnded(false);
  }, []);

  return (
    <EliminationContext.Provider
      children={children}
      value={{
        hasEliminationAnimationEnded,
        isEliminated,
        onEliminationEnd: () => setHasEliminationAnimationEnded(true),
        resetEliminationContext,
      }}
    />
  );
};
