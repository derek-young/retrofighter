import React, {useCallback, useContext, useEffect, useState} from 'react';

import {useGameContext} from 'Game/GameContext';
import {Enemies, startingEnemies} from 'Game/constants';

import DualFighter from './DualFighter';
import EnemyCargoShip from './EnemyCargoShip';
import EnemySpeeder from './EnemySpeeder';
import EnemyUAV from './EnemyUAV';

function getEnemyComponent(enemyName: Enemies) {
  switch (enemyName) {
    case Enemies.CARGO_SHIP:
      return EnemyCargoShip;
    case Enemies.DUAL_FIGHTER:
      return DualFighter;
    case Enemies.SPEEDER:
      return EnemySpeeder;
    case Enemies.UAV:
      return EnemyUAV;
  }
}

interface Enemy {
  key: number;
  Enemy: typeof DualFighter | typeof EnemyUAV | typeof EnemySpeeder;
  hasEliminationAnimationEnded: boolean;
  isEliminated: boolean;
  onEliminationAnimationEnd: () => void;
  onIsEliminated: () => void;
}

interface EnemyFactoryContextValue {
  areAllEnemiesEliminated: boolean;
  enemies: (null | Enemy)[];
}

const defaultValue: EnemyFactoryContextValue = {
  areAllEnemiesEliminated: false,
  enemies: [
    {
      key: 1,
      Enemy: DualFighter,
      hasEliminationAnimationEnded: false,
      isEliminated: false,
      onEliminationAnimationEnd: () => {},
      onIsEliminated: () => {},
    },
  ],
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

  const createEnemy = useCallback((key: number, enemyName: Enemies) => {
    const Enemy = getEnemyComponent(enemyName);

    return {
      key,
      Enemy,
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
    };
  }, []);

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

  const areAllEnemiesEliminated = enemies.every(
    e => e === null || e.isEliminated,
  );

  return (
    <EnemyFactoryContext.Provider
      children={children}
      value={{areAllEnemiesEliminated, enemies}}
    />
  );
};
