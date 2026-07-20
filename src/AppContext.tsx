import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {Alert} from 'react-native';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {useNavigation} from '@react-navigation/native';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {appleAuth} from '@invertase/react-native-apple-authentication';

import {leaderboardActions, userActions} from 'database';
import {
  UserRecords,
  getTotalScore,
  mergeLevelCompletion,
} from 'database/records';
import {getDisplayName} from 'Catalog/utils';
import {CatalogNavigationProp} from 'types/app';

const noop = () => {};

export type AuthUser = null | FirebaseAuthTypes.User;

const defaultValue: AppContextValue = {
  bestTimes: [],
  onDeleteAcct: noop,
  onSignOut: noop,
  scores: [],
  recordLevelCompletion: noop,
  totalScore: 0,
  user: null,
  setUser: noop,
};

interface AppContextValue {
  bestTimes: number[];
  onDeleteAcct: () => void;
  onSignOut: () => void;
  scores: number[];
  recordLevelCompletion: (
    level: number,
    score: number,
    elapsedSeconds: number,
  ) => void;
  totalScore: number;
  user: AuthUser;
  setUser: (user: AuthUser) => void;
}

const AppContext = React.createContext(defaultValue);

export const useAppContext = () => useContext(AppContext);

export const AppContextProvider = ({children}: {children: React.ReactNode}) => {
  const [user, setUser] = useState<AuthUser>(null);
  const [scores, setScores] = useState<number[]>([]);
  const [levelTimes, setLevelTimes] = useState<number[]>([]);
  const [bestTimes, setBestTimes] = useState<number[]>([]);
  const navigation = useNavigation<CatalogNavigationProp>();

  const totalScore = useMemo(() => getTotalScore(scores), [scores]);

  const setRemoteRecords = useCallback(
    (next: UserRecords) => {
      if (user?.uid) {
        // userActions.set replaces the whole user record, so all three
        // record arrays must always be written together.
        userActions.set(next);
        leaderboardActions.set({
          displayName: getDisplayName(user),
          totalScore: getTotalScore(next.scores),
          bestTimes: next.bestTimes,
        });
      }
    },
    [user],
  );

  const recordLevelCompletion = useCallback(
    (level: number, score: number, elapsedSeconds: number) => {
      const next = mergeLevelCompletion(
        {scores, levelTimes, bestTimes},
        level,
        score,
        elapsedSeconds,
      );

      if (next) {
        setScores(next.scores);
        setLevelTimes(next.levelTimes);
        setBestTimes(next.bestTimes);
        setRemoteRecords(next);
      }
    },
    [bestTimes, levelTimes, scores, setRemoteRecords],
  );

  const onDeleteConfirm = useCallback(async () => {
    try {
      const providerId = user?.providerData[0]?.providerId;
      let credential;

      if (providerId === 'google.com') {
        await GoogleSignin.hasPlayServices();
        const response = await GoogleSignin.signIn();

        if (response.type === 'cancelled') {
          return;
        }

        credential = auth.GoogleAuthProvider.credential(response.data.idToken);
      } else if (providerId === 'apple.com') {
        const appleAuthRequestResponse = await appleAuth.performRequest({
          requestedOperation: appleAuth.Operation.LOGIN,
          requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
        });

        const {identityToken, nonce} = appleAuthRequestResponse;
        credential = auth.AppleAuthProvider.credential(identityToken, nonce);
      }

      if (credential) {
        await user?.reauthenticateWithCredential(credential);
        // The leaderboard entry is readable by other players, so it must be
        // removed while this uid can still write its own node.
        await leaderboardActions.remove();
        await user?.delete();
        navigation.navigate('Login');
      }
    } catch (e) {
      console.log('Error deleting user', e);
    }
  }, [navigation, user]);

  const onDeleteAcct = useCallback(async () => {
    Alert.alert(
      'Are you sure?',
      'This will permanently erase all data. This action cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'OK', onPress: onDeleteConfirm},
      ],
    );
  }, [onDeleteConfirm]);

  const onSignOut = useCallback(async () => {
    await auth().signOut();
    navigation.navigate('Login');
  }, [navigation]);

  useEffect(() => {
    if (user?.uid) {
      const promise = userActions.get().then(dbUser => {
        if (dbUser?.scores) {
          // Firebase returns sparse arrays as keyed objects; normalize.
          // Accounts predating bestTimes are seeded from levelTimes (its 0
          // fillers carry through as "no time").
          const nextBestTimes: number[] = Object.assign(
            [],
            dbUser.bestTimes ?? dbUser.levelTimes ?? [],
          );

          setScores(dbUser.scores);
          setLevelTimes(Object.assign([], dbUser.levelTimes ?? []));
          setBestTimes(nextBestTimes);

          // Refresh the public mirror every login: it keeps the display name
          // current and seeds entries for accounts predating the leaderboard.
          leaderboardActions.set({
            displayName: getDisplayName(user),
            totalScore: getTotalScore(dbUser.scores),
            bestTimes: nextBestTimes,
          });
        } else {
          userActions.set({scores: [], levelTimes: [], bestTimes: []});
          leaderboardActions.set({
            displayName: getDisplayName(user),
            totalScore: 0,
            bestTimes: [],
          });
        }
      });
      // Never let a failed read fall through silently: that would leave scores
      // at 0 and look like the save never happened.
      promise.catch(e => console.log('Failed to load user records', e));
    }

    return () => {
      setScores([]);
      setLevelTimes([]);
      setBestTimes([]);
    };
    // Keyed on the uid, not the user object: auth can hand back new user
    // references for the same account, and reloading then would blank the
    // local records mid-session.
  }, [user?.uid]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AppContext.Provider
      children={children}
      value={{
        bestTimes,
        onDeleteAcct,
        onSignOut,
        recordLevelCompletion,
        scores,
        totalScore,
        user,
        setUser,
      }}
    />
  );
};
