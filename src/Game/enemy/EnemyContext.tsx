import React, {useContext, useEffect, useState} from 'react';

import {Facing} from 'Game/types';
import {
  defaultPlayerFacing,
  playerStartLeft,
  playerStartTop,
} from 'Game/gameConstants';
import {useAnimationContext} from 'Game/Fighter/AnimationContext';

type EnemyValue = {
  playerFacing: Facing;
  hasPlayerMoved: boolean;
  playerLeft: number;
  playerTop: number;
};

const defaultValue: EnemyValue = {
  playerFacing: defaultPlayerFacing,
  hasPlayerMoved: false,
  playerLeft: playerStartLeft,
  playerTop: playerStartTop,
};

const EnemyContext = React.createContext(defaultValue);

export const useEnemyContext = () => useContext(EnemyContext);

export const EnemyProvider = ({children}: {children: React.ReactNode}) => {
  const {facing, hasPlayerMoved, topAnim, leftAnim} = useAnimationContext();
  const [playerLeft, setPlayerLeft] = useState<number>(playerStartLeft);
  const [playerTop, setPlayerTop] = useState<number>(playerStartTop);

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
