import React, {useState} from 'react';
import {StyleSheet} from 'react-native';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';

import {useAppContext} from 'AppContext';

const styles = StyleSheet.create({
  button: {
    height: 48,
    width: 192,
  },
});

enum STATUS {
  IDLE = 'idle',
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

GoogleSignin.configure();

const SigninButton = () => {
  const {setUser} = useAppContext();
  const [authStatus, setAuthStatus] = useState(STATUS.IDLE);

  const signIn = async () => {
    try {
      setAuthStatus(STATUS.PENDING);

      await GoogleSignin.hasPlayServices();
      const {idToken} = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const resFromSignin = await auth().signInWithCredential(googleCredential);

      setUser(resFromSignin.user);
      setAuthStatus(STATUS.SUCCESS);
    } catch (error) {
      if (error?.code === statusCodes.SIGN_IN_CANCELLED) {
        setAuthStatus(STATUS.IDLE);
      } else {
        console.log('error', error);
        setAuthStatus(STATUS.FAILED);
      }
    }
  };

  return (
    <GoogleSigninButton
      color={GoogleSigninButton.Color.Light}
      disabled={authStatus === STATUS.PENDING}
      onPress={signIn}
      size={GoogleSigninButton.Size.Wide}
      style={styles.button}
    />
  );
};

export default SigninButton;
