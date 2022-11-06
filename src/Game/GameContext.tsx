import React, {useContext, useState} from 'react';

const noop = () => {};

const defaultValue: GameContextValue = {
  epic: 0,
  isPaused: false,
  setIsPaused: noop,
  remainingLives: 1,
  setRemainingLives: noop,
};

interface GameContextValue {
  epic: number;
  isPaused: boolean;
  setIsPaused: (isPaused: boolean) => void;
  remainingLives: number;
  setRemainingLives: React.Dispatch<React.SetStateAction<number>>;
}

interface GameProviderProps {
  children: React.ReactNode;
  epic: number;
}

const GameContext = React.createContext(defaultValue);

export const useGameContext = () => useContext(GameContext);

export const GameProvider = ({children, epic}: GameProviderProps) => {
  const [isPaused, setIsPaused] = useState(false);
  const [remainingLives, setRemainingLives] = useState(1);

  return (
    <GameContext.Provider
      children={children}
      value={{epic, isPaused, setIsPaused, remainingLives, setRemainingLives}}
    />
  );
};
