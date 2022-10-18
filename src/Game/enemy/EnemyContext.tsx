import React, {useContext, useEffect, useState} from 'react';

import {
  startTop,
  startLeft,
  useFighterContext,
} from 'Game/Fighter/FigherContext';

type EnemyValue = {
  hasPlayerMoved: boolean;
  playerLeft: number;
  playerTop: number;
};

const defaultValue: EnemyValue = {
  hasPlayerMoved: false,
  playerLeft: startLeft,
  playerTop: startTop,
};

const EnemyContext = React.createContext(defaultValue);

export const useEnemyContext = () => useContext(EnemyContext);

export const EnemyProvider = ({children}: {children: React.ReactNode}) => {
  const {hasPlayerMoved, topAnim, leftAnim} = useFighterContext();
  const [playerLeft, setPlayerLeft] = useState<number>(startLeft);
  const [playerTop, setPlayerTop] = useState<number>(startTop);

  useEffect(() => {
    leftAnim.addListener(({value}) => setPlayerLeft(value));
    topAnim.addListener(({value}) => setPlayerTop(value));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <EnemyContext.Provider
      children={children}
      value={{hasPlayerMoved, playerLeft, playerTop}}
    />
  );
};
