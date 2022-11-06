import React, {useContext, useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';

import {GameNavigationProp} from 'types/app';

const noop = () => {};

const defaultValue: GameContextValue = {
  epic: 0,
  isPaused: false,
  setIsPaused: noop,
  remainingLives: 1,
  setRemainingLives: noop,
  totalScore: 0,
  setTotalScore: noop,
};

interface GameContextValue {
  epic: number;
  isPaused: boolean;
  setIsPaused: (isPaused: boolean) => void;
  remainingLives: number;
  setRemainingLives: React.Dispatch<React.SetStateAction<number>>;
  totalScore: number;
  setTotalScore: React.Dispatch<React.SetStateAction<number>>;
}

interface GameProviderProps {
  children: React.ReactNode;
  epic: number;
}

const GameContext = React.createContext(defaultValue);

export const useGameContext = () => useContext(GameContext);

export const GameProvider = ({children, epic}: GameProviderProps) => {
  const navigation = useNavigation<GameNavigationProp>();
  const [isPaused, setIsPaused] = useState(false);
  const [remainingLives, setRemainingLives] = useState(1);
  const [totalScore, setTotalScore] = useState(0);

  useEffect(() => {
    const unsubscribe = navigation?.addListener('blur', () => {
      setRemainingLives(1);
      setTotalScore(0);
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <GameContext.Provider
      children={children}
      value={{
        epic,
        isPaused,
        setIsPaused,
        remainingLives,
        setRemainingLives,
        totalScore,
        setTotalScore,
      }}
    />
  );
};
