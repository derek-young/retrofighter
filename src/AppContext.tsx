import React, {useContext, useState} from 'react';
import {FirebaseAuthTypes} from '@react-native-firebase/auth';

const noop = () => {};

export type AuthUser = null | FirebaseAuthTypes.User;

const defaultValue: AppContextValue = {
  user: null,
  setUser: noop,
};

interface AppContextValue {
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

  return (
    <AppContext.Provider
      children={children}
      value={{
        user,
        setUser,
      }}
    />
  );
};
