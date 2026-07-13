import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {useNavigation} from '@react-navigation/native';
import {GameNavigationProp} from 'types/app';

import {ItemEffectsSnapshot} from './engine/Simulation';

const noop = () => {};

const defaultValue: GameContextValue = {
  adjustScore: noop,
  carryEffects: noop,
  consumeCarriedEffects: () => null,
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
  carryEffects: (effects: ItemEffectsSnapshot) => void;
  consumeCarriedEffects: () => null | ItemEffectsSnapshot;
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
  // The player's item effects carried into the next level. Lives here
  // because the provider survives the level swap that remounts the
  // simulation and item providers.
  const carriedEffectsRef = useRef<null | ItemEffectsSnapshot>(null);

  const carryEffects = useCallback((effects: ItemEffectsSnapshot) => {
    carriedEffectsRef.current = effects;
  }, []);

  const consumeCarriedEffects = useCallback(() => {
    const effects = carriedEffectsRef.current;

    carriedEffectsRef.current = null;

    return effects;
  }, []);

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
      carriedEffectsRef.current = null;
    });

    return unsubscribe;
  }, [navigation]);

  const value = useMemo(
    () => ({
      adjustScore,
      carryEffects,
      consumeCarriedEffects,
      epic,
      isPaused,
      setIsPaused,
      remainingLives,
      resetGameContext,
      setRemainingLives,
      scoreForLevel,
    }),
    [
      adjustScore,
      carryEffects,
      consumeCarriedEffects,
      epic,
      isPaused,
      remainingLives,
      resetGameContext,
      scoreForLevel,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
