import React, {useContext, useMemo, useState} from 'react';

import DualFighter from './DualFighter';
import EnemyUAV from './EnemyUAV';

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
  epic: number;
}

const EnemyFactoryContext = React.createContext(defaultValue);

export const useEnemyFactoryContext = () => useContext(EnemyFactoryContext);

const startingEnemies = [
  [null, null, null, EnemyUAV, null, EnemyUAV, null, EnemyUAV],
  [null, null, null, EnemyUAV, EnemyUAV, DualFighter, EnemyUAV, EnemyUAV],
  [
    null,
    null,
    EnemyUAV,
    EnemyUAV,
    DualFighter,
    DualFighter,
    DualFighter,
    EnemyUAV,
    EnemyUAV,
  ],
  [
    null,
    EnemyUAV,
    EnemyUAV,
    DualFighter,
    DualFighter,
    DualFighter,
    DualFighter,
    DualFighter,
    EnemyUAV,
    EnemyUAV,
  ],
  [
    DualFighter,
    DualFighter,
    DualFighter,
    DualFighter,
    DualFighter,
    DualFighter,
    DualFighter,
    DualFighter,
    DualFighter,
    DualFighter,
  ],
];

export const EnemyFactoryProvider = ({
  children,
  epic,
}: EnemyFactoryProviderProps) => {
  const [eliminatedEnemies, setEliminatedEnemies] = useState<boolean[]>([]);
  const [animationEnded, setAnimationEnded] = useState<boolean[]>([]);

  const enemies = useMemo(
    () =>
      startingEnemies[epic].map((Enemy, i) =>
        Enemy === null
          ? null
          : {
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
            },
      ),
    [animationEnded, eliminatedEnemies, epic],
  );

  return <EnemyFactoryContext.Provider children={children} value={enemies} />;
};
