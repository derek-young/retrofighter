import React, {useState} from 'react';
import {StyleSheet} from 'react-native';
import auth from '@react-native-firebase/auth';
import {
  AppleButton,
  appleAuth,
} from '@invertase/react-native-apple-authentication';

import {useAppContext} from 'AppContext';

const styles = StyleSheet.create({
  button: {
    height: 42,
    width: 184,
    marginTop: 8,
  },
});

enum STATUS {
  IDLE = 'idle',
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

const AppleSigninButton = () => {
  const {setUser} = useAppContext();
  const [authStatus, setAuthStatus] = useState(STATUS.IDLE);

  const signIn = async () => {
    try {
      setAuthStatus(STATUS.PENDING);

      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      // Ensure Apple returned a user identityToken
      if (!appleAuthRequestResponse.identityToken) {
        throw new Error('Apple Sign-In failed - no identify token returned');
      }

      // Create a Firebase credential from the response
      const {identityToken, nonce} = appleAuthRequestResponse;
      const appleCredential = auth.AppleAuthProvider.credential(
        identityToken,
        nonce,
      );

      const resFromSignin = await auth().signInWithCredential(appleCredential);

      setUser(resFromSignin.user);
      setAuthStatus(STATUS.SUCCESS);
    } catch (error) {
      console.log('error', error);
      setAuthStatus(STATUS.FAILED);
    }
  };

  return (
    <AppleButton
      buttonStyle={AppleButton.Style.WHITE_OUTLINE}
      buttonType={AppleButton.Type.SIGN_IN}
      onPress={signIn}
      style={[
        styles.button,
        {opacity: authStatus === STATUS.PENDING ? 0.7 : 1}, // eslint-disable-line react-native/no-inline-styles
      ]}
    />
  );
};

export default AppleSigninButton;
