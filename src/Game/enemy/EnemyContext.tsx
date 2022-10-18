import React, {useContext, useEffect, useState} from 'react';

import {Facing} from 'Game/types';
import {defaultPlayerFacing} from 'Game/gameConstants';
import {
  startTop,
  startLeft,
  useFighterContext,
} from 'Game/Fighter/FigherContext';

type EnemyValue = {
  playerFacing: Facing;
  hasPlayerMoved: boolean;
  playerLeft: number;
  playerTop: number;
};

const defaultValue: EnemyValue = {
  playerFacing: defaultPlayerFacing,
  hasPlayerMoved: false,
  playerLeft: startLeft,
  playerTop: startTop,
};

const EnemyContext = React.createContext(defaultValue);

export const useEnemyContext = () => useContext(EnemyContext);

export const EnemyProvider = ({children}: {children: React.ReactNode}) => {
  const {facing, hasPlayerMoved, topAnim, leftAnim} = useFighterContext();
  const [playerLeft, setPlayerLeft] = useState<number>(startLeft);
  const [playerTop, setPlayerTop] = useState<number>(startTop);

  useEffect(() => {
    leftAnim.addListener(({value}) => setPlayerLeft(value));
    topAnim.addListener(({value}) => setPlayerTop(value));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <EnemyContext.Provider
      children={children}
      value={{hasPlayerMoved, playerFacing: facing, playerLeft, playerTop}}
    />
  );
};
