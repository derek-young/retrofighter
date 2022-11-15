import React, {useCallback, useContext, useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {GameNavigationProp} from 'types/app';

const noop = () => {};

const defaultValue: GameContextValue = {
  adjustScore: noop,
  epic: 0,
  isPaused: false,
  pendingScores: [],
  setIsPaused: noop,
  remainingLives: 1,
  setRemainingLives: noop,
  scoreForLevel: 0,
};

interface GameContextValue {
  adjustScore: (score: number) => void;
  epic: number;
  isPaused: boolean;
  pendingScores: number[];
  setIsPaused: (isPaused: boolean) => void;
  remainingLives: number;
  setRemainingLives: React.Dispatch<React.SetStateAction<number>>;
  scoreForLevel: number;
}

interface GameProviderProps {
  children: React.ReactNode;
  epic: number;
}

const GameContext = React.createContext(defaultValue);

export const useGameContext = () => useContext(GameContext);

export const scorePersistMs = 4000;

let lastSet = Date.now();

export const GameProvider = ({children, epic}: GameProviderProps) => {
  const navigation = useNavigation<GameNavigationProp>();
  const [isPaused, setIsPaused] = useState(false);
  const [remainingLives, setRemainingLives] = useState(1);
  const [pendingScores, setPendingScores] = useState<number[]>([]);
  const [scoreForLevel, setScoreForLevel] = useState(0);

  const resetScores = useCallback(() => {
    const now = Date.now();

    if (now - lastSet > scorePersistMs) {
      setPendingScores([]);
    }

    setTimeout(resetScores, now - lastSet);
  }, []);

  const adjustScore = useCallback(
    (score: number) => {
      setScoreForLevel(s => s + score);

      if (Date.now() - lastSet > 400) {
        lastSet = Date.now();
        setPendingScores(scores => [...scores, score]);
      } else {
        setTimeout(() => {
          lastSet = Date.now();
          setPendingScores(scores => [...scores, score]);
        }, 400);
      }

      resetScores();
    },
    [resetScores],
  );

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
        pendingScores,
        setIsPaused,
        remainingLives,
        setRemainingLives,
        scoreForLevel,
      }}
    />
  );
};
