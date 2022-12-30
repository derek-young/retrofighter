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

import {userActions} from 'database';
import {CatalogNavigationProp} from 'types/app';

const noop = () => {};

export type AuthUser = null | FirebaseAuthTypes.User;

const defaultValue: AppContextValue = {
  onDeleteAcct: noop,
  onSignOut: noop,
  scores: [],
  recordScores: noop,
  totalScore: 0,
  user: null,
  setUser: noop,
};

interface AppContextValue {
  onDeleteAcct: () => void;
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

  const onDeleteConfirm = useCallback(async () => {
    try {
      const providerId = user?.providerData[0]?.providerId;
      let credential;

      if (providerId === 'google.com') {
        await GoogleSignin.hasPlayServices();
        const {idToken} = await GoogleSignin.signIn();
        credential = auth.GoogleAuthProvider.credential(idToken);
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
      userActions.get().then(dbUser => {
        if (dbUser?.scores) {
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
        onDeleteAcct,
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
