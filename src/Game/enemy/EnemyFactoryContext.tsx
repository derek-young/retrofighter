import React, {useContext, useMemo, useState} from 'react';

import {useGameContext} from 'Game/GameContext';
import {Enemies, startingEnemies} from 'Game/constants';

import DualFighter from './DualFighter';
import EnemyUAV from './EnemyUAV';

function getEnemyComponent(enemyName: Enemies | null) {
  switch (enemyName) {
    case Enemies.DUAL_FIGHTER:
      return DualFighter;
    case Enemies.UAV:
      return EnemyUAV;
    default:
      return null;
  }
}

interface Enemy {
  key: number;
  Enemy: typeof DualFighter | typeof EnemyUAV;
  hasEliminationAnimationEnded: boolean;
  isEliminated: boolean;
  onEliminationAnimationEnd: () => void;
  onIsEliminated: () => void;
}

type EnemyFactoryContextValue = (null | Enemy)[];

const defaultValue: EnemyFactoryContextValue = [
  {
    key: 1,
    Enemy: DualFighter,
    hasEliminationAnimationEnded: false,
    isEliminated: false,
    onEliminationAnimationEnd: () => {},
    onIsEliminated: () => {},
  },
];

interface EnemyFactoryProviderProps {
  children: React.ReactNode;
}

const EnemyFactoryContext = React.createContext(defaultValue);

export const useEnemyFactoryContext = () => useContext(EnemyFactoryContext);

export const EnemyFactoryProvider = ({children}: EnemyFactoryProviderProps) => {
  const {epic} = useGameContext();
  const [eliminatedEnemies, setEliminatedEnemies] = useState<boolean[]>([]);
  const [animationEnded, setAnimationEnded] = useState<boolean[]>([]);

  const enemies = useMemo(
    () =>
      startingEnemies[epic].map((enemyName, i) => {
        const Enemy = getEnemyComponent(enemyName);

        if (Enemy === null) {
          return null;
        }

        return {
          key: i,
          Enemy,
          hasEliminationAnimationEnded: animationEnded[i],
          onEliminationAnimationEnd: () => {
            const next = [...animationEnded];
            next[i] = true;
            return setAnimationEnded(next);
          },
          isEliminated: eliminatedEnemies[i],
          onIsEliminated: () => {
            const nextElim = [...eliminatedEnemies];
            nextElim[i] = true;
            return setEliminatedEnemies(nextElim);
          },
        };
      }),
    [animationEnded, eliminatedEnemies, epic],
  );

  return <EnemyFactoryContext.Provider children={children} value={enemies} />;
};
