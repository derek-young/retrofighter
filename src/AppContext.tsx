import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {useNavigation} from '@react-navigation/native';

import {userActions} from 'database';
import {CatalogNavigationProp} from 'types/app';

const noop = () => {};

export type AuthUser = null | FirebaseAuthTypes.User;

const defaultValue: AppContextValue = {
  onSignOut: noop,
  scores: [],
  recordScores: noop,
  totalScore: 0,
  user: null,
  setUser: noop,
};

interface AppContextValue {
  onSignOut: () => void;
  scores: number[];
  recordScores: (level: number, score: number) => void;
  totalScore: number;
  user: AuthUser;
  setUser: (user: AuthUser) => void;
}

const AppContext = React.createContext(defaultValue);

export const useAppContext = () => useContext(AppContext);

export const AppContextProvider = ({children}: {children: React.ReactNode}) => {
  const [user, setUser] = useState<AuthUser>(null);
  const [scores, setScores] = useState<number[]>([]);
  const navigation = useNavigation<CatalogNavigationProp>();

  const totalScore = useMemo(
    () => scores.reduce((acc, score) => acc + score, 0),
    [scores],
  );

  const setRemoteScores = useCallback(
    (nextScores: number[]) => {
      if (user?.uid) {
        userActions.set({scores: nextScores});
      }
    },
    [user?.uid],
  );

  const recordScores = useCallback(
    (level: number, score: number) => {
      if ((scores[level] ?? 0) < score) {
        const nextScores = scores.slice();
        nextScores[level] = score;
        setScores(nextScores);
        setRemoteScores(nextScores);
      }
    },
    [scores, setRemoteScores],
  );

  const onSignOut = useCallback(async () => {
    await auth().signOut();
    navigation.navigate('Login');
  }, [navigation]);

  useEffect(() => {
    if (user?.uid) {
      userActions.get().then(dbUser => {
        if (dbUser.scores) {
          setScores(dbUser.scores);
        } else {
          userActions.set({scores: []});
        }
      });
    }

    return () => setScores([]);
  }, [user?.uid]);

  return (
    <AppContext.Provider
      children={children}
      value={{
        onSignOut,
        recordScores,
        scores,
        totalScore,
        user,
        setUser,
      }}
    />
  );
};
