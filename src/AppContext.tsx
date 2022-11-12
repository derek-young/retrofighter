import React, {useContext, useEffect, useState} from 'react';
import {FirebaseAuthTypes} from '@react-native-firebase/auth';

import {userActions} from 'database';

const noop = () => {};

export type AuthUser = null | FirebaseAuthTypes.User;

const defaultValue: AppContextValue = {
  highScore: 0,
  setHighScore: noop,
  user: null,
  setUser: noop,
};

interface AppContextValue {
  highScore: number;
  setHighScore: React.Dispatch<React.SetStateAction<number>>;
  user: AuthUser;
  setUser: (user: AuthUser) => void;
}

const AppContext = React.createContext(defaultValue);

export const useAppContext = () => useContext(AppContext);

export const AppContextProvider = ({
  children,
}: {
  children: React.ReactElement;
}) => {
  const [user, setUser] = useState<AuthUser>(null);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    if (user?.uid) {
      userActions.get().then(dbUser => setHighScore(dbUser.highScore ?? 0));
    }
  }, [user?.uid]);

  useEffect(() => {
    if (user?.uid) {
      userActions.set({highScore});
    }
  }, [highScore, user?.uid]);

  return (
    <AppContext.Provider
      children={children}
      value={{
        highScore,
        setHighScore,
        user,
        setUser,
      }}
    />
  );
};
