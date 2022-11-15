import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {FirebaseAuthTypes} from '@react-native-firebase/auth';

import {userActions} from 'database';

const noop = () => {};

export type AuthUser = null | FirebaseAuthTypes.User;

const defaultValue: AppContextValue = {
  scores: [],
  recordScores: noop,
  totalScore: 0,
  user: null,
  setUser: noop,
};

interface AppContextValue {
  scores: number[];
  recordScores: (level: number, score: number) => void;
  totalScore: number;
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
  const [scores, setScores] = useState<number[]>([]);

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
  }, [user?.uid]);

  return (
    <AppContext.Provider
      children={children}
      value={{
        recordScores,
        scores,
        totalScore,
        user,
        setUser,
      }}
    />
  );
};
