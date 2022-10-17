import React, {useContext, useEffect, useState} from 'react';

import {useFighterContext} from 'Game/Fighter/FigherContext';

type EnemyValue = {
  playerLeft: null | number;
  playerTop: null | number;
};

const defaultValue: EnemyValue = {
  playerLeft: null,
  playerTop: null,
};

const EnemyContext = React.createContext(defaultValue);

export const useEnemyContext = () => useContext(EnemyContext);

export const EnemyProvider = ({children}: {children: React.ReactNode}) => {
  const {topAnim, leftAnim} = useFighterContext();
  const [playerLeft, setPlayerLeft] = useState<null | number>(null);
  const [playerTop, setPlayerTop] = useState<null | number>(null);

  useEffect(() => {
    leftAnim.addListener(({value}) => setPlayerLeft(value));
    topAnim.addListener(({value}) => setPlayerTop(value));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <EnemyContext.Provider
      children={children}
      value={{playerLeft, playerTop}}
    />
  );
};
