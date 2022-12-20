import React, {useCallback, useContext, useEffect, useState} from 'react';

import {useGameContext} from 'Game/GameContext';
import {Enemies, startingEnemies} from 'Game/constants';

interface Enemy {
  key: number;
  enemyName: Enemies;
  hasEliminationAnimationEnded: boolean;
  isEliminated: boolean;
  onEliminationAnimationEnd: () => void;
  onIsEliminated: () => void;
}

interface EnemyFactoryContextValue {
  addEnemy: (
    enemyName: Enemies,
    position: {startingLeft: number; startingTop: number},
  ) => void;
  areAllEnemiesEliminated: boolean;
  enemies: (null | Enemy)[];
  removeEnemy: (key: number) => void;
}

const defaultValue: EnemyFactoryContextValue = {
  addEnemy: () => {},
  areAllEnemiesEliminated: false,
  enemies: [
    {
      key: 1,
      enemyName: Enemies.DUAL_FIGHTER,
      hasEliminationAnimationEnded: false,
      isEliminated: false,
      onEliminationAnimationEnd: () => {},
      onIsEliminated: () => {},
    },
  ],
  removeEnemy: () => {},
};

interface EnemyFactoryProviderProps {
  children: React.ReactNode;
}

const EnemyFactoryContext = React.createContext(defaultValue);

export const useEnemyFactoryContext = () => useContext(EnemyFactoryContext);

export const EnemyFactoryProvider = ({children}: EnemyFactoryProviderProps) => {
  const {epic} = useGameContext();
  const [eliminatedEnemies, setEliminatedEnemies] = useState<boolean[]>([]);
  const [animationEnded, setAnimationEnded] = useState<boolean[]>([]);

  const createEnemy = useCallback(
    (key: number, enemyName: Enemies, overrides = {}) => {
      return {
        key,
        enemyName,
        hasEliminationAnimationEnded: false,
        isEliminated: false,
        onEliminationAnimationEnd: () =>
          setAnimationEnded(curr => {
            const next = [...curr];
            next[key] = true;
            return next;
          }),
        onIsEliminated: () =>
          setEliminatedEnemies(currElim => {
            const nextElim = [...currElim];
            nextElim[key] = true;
            return nextElim;
          }),
        ...overrides,
      };
    },
    [],
  );

  const [enemies, setEnemies] = useState(
    startingEnemies[epic].map((enemyName, i) => {
      if (enemyName === null) {
        return null;
      }

      return createEnemy(i, enemyName);
    }),
  );

  useEffect(() => {
    setEnemies(currentEnemies =>
      currentEnemies.map((enemy, i) => {
        if (enemy === null) {
          return null;
        }

        return {
          ...enemy,
          hasEliminationAnimationEnded: animationEnded[i],
          isEliminated: eliminatedEnemies[i],
        };
      }),
    );
  }, [animationEnded, eliminatedEnemies]);

  const addEnemy = useCallback(
    (
      enemyName: Enemies,
      position: {startingLeft: number; startingTop: number},
    ) =>
      setEnemies(e => {
        const next = [...e];
        const newEnemy = createEnemy(next.length, enemyName, position);
        next.push(newEnemy);
        return next;
      }),
    [createEnemy],
  );

  const removeEnemy = useCallback(
    (key: number) =>
      setEnemies(e => {
        const next = [...e];
        next[key] = null;
        return next;
      }),
    [],
  );

  const areAllEnemiesEliminated = enemies.every(
    e => e === null || e.isEliminated,
  );

  return (
    <EnemyFactoryContext.Provider
      children={children}
      value={{addEnemy, areAllEnemiesEliminated, enemies, removeEnemy}}
    />
  );
};
