import React, {useContext, useState} from 'react';
import {FirebaseAuthTypes} from '@react-native-firebase/auth';

const noop = () => {};

export type FireBaseUser = null | FirebaseAuthTypes.User;

const defaultValue: AppContextValue = {
  user: null,
  setUser: noop,
};

interface AppContextValue {
  user: FireBaseUser;
  setUser: (user: FireBaseUser) => void;
}

const AppContext = React.createContext(defaultValue);

export const useAppContext = () => useContext(AppContext);

export const AppContextProvider = ({
  children,
}: {
  children: React.ReactElement;
}) => {
  const [user, setUser] = useState<FireBaseUser>(null);

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
