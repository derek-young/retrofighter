import React, {useContext} from 'react';

type GameContextValue = {
  isPaused: boolean;
};

const defaultValue: GameContextValue = {
  isPaused: false,
};

interface GameProviderProps {
  children: React.ReactNode;
  isPaused: boolean;
}

const GameContext = React.createContext(defaultValue);

export const useGameContext = () => useContext(GameContext);

export const GameProvider = ({children, isPaused}: GameProviderProps) => {
  return <GameContext.Provider children={children} value={{isPaused}} />;
};
