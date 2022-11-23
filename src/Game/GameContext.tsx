import React, {useCallback, useContext, useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {GameNavigationProp} from 'types/app';

const noop = () => {};

const defaultValue: GameContextValue = {
  adjustScore: noop,
  epic: 0,
  isPaused: false,
  setIsPaused: noop,
  remainingLives: 1,
  resetGameContext: noop,
  setRemainingLives: noop,
  scoreForLevel: 0,
};

interface GameContextValue {
  adjustScore: (score: number) => void;
  epic: number;
  isPaused: boolean;
  setIsPaused: (isPaused: boolean) => void;
  remainingLives: number;
  resetGameContext: () => void;
  setRemainingLives: React.Dispatch<React.SetStateAction<number>>;
  scoreForLevel: number;
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
  const [scoreForLevel, setScoreForLevel] = useState(0);

  const resetGameContext = useCallback(() => {
    setRemainingLives(1);
    setScoreForLevel(0);
  }, []);

  const adjustScore = useCallback(
    (score: number) => setScoreForLevel(s => s + score),
    [],
  );

  useEffect(() => {
    setScoreForLevel(0);
  }, [epic]);

  useEffect(() => {
    const unsubscribe = navigation?.addListener('blur', () => {
      setRemainingLives(1);
      setScoreForLevel(0);
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <GameContext.Provider
      children={children}
      value={{
        adjustScore,
        epic,
        isPaused,
        setIsPaused,
        remainingLives,
        resetGameContext,
        setRemainingLives,
        scoreForLevel,
      }}
    />
  );
};
