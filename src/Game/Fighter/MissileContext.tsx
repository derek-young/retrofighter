import React, {useCallback, useContext, useState} from 'react';

type MissileContextValue = {
  hasLeftMissileFired: boolean;
  hasRightMissileFired: boolean;
  onFireLeftMissile: () => void;
  onFireRightMissile: () => void;
};

const noop = () => {};

const defaultValue: MissileContextValue = {
  hasLeftMissileFired: false,
  hasRightMissileFired: false,
  onFireLeftMissile: noop,
  onFireRightMissile: noop,
};

const MissileContext = React.createContext(defaultValue);

export const useMissileContext = () => useContext(MissileContext);

export const MissileProvider = ({children}: {children: React.ReactNode}) => {
  const [hasLeftMissileFired, setHasLeftMissileFired] = useState(false);
  const [hasRightMissileFired, setHasRightMissileFired] = useState(false);

  const onFireLeftMissile = useCallback(() => setHasLeftMissileFired(true), []);
  const onFireRightMissile = useCallback(
    () => setHasRightMissileFired(true),
    [],
  );

  return (
    <MissileContext.Provider
      children={children}
      value={{
        hasLeftMissileFired,
        hasRightMissileFired,
        onFireLeftMissile,
        onFireRightMissile,
      }}
    />
  );
};
