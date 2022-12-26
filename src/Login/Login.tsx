import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  StyleSheet,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';

import Colors from 'types/colors';
import {LoginNavigationProp} from 'types/app';
import loginBackground from 'images/backdrop_login.jpg';
import GradientText from 'components/GradientText';
import IBMText from 'components/IBMText';
import PressStartText from 'components/PressStartText';

import CraftPreview from './CraftPreview';
import AppleSigninButton from './AppleSigninButton';
import GoogleSigninButton from './GoogleSigninButton';
import {useAppContext} from 'AppContext';

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: `${Colors.DEEP_PURPLE}10`,
    paddingTop: 64,
  },
  top: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    shadowColor: 'black',
    shadowOffset: {height: 4, width: 4},
    shadowOpacity: 0.4,
  },
  preview: {
    flex: 0.5,
    justifyContent: 'flex-end',
  },
  center: {
    flex: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottom: {
    flex: 1,
  },
  title: {
    fontSize: 40,
    textAlign: 'center',
    fontFamily: 'PressStart2P-Regular',
  },
  continueText: {
    fontSize: 24,
    color: Colors.GREEN,
    textDecorationLine: 'underline',
  },
  textShadow: {
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10,
  },
  basicText: {
    color: 'white',
    margin: 16,
  },
});

const Login = (): JSX.Element => {
  const {user, setUser} = useAppContext();
  const navigation = useNavigation<LoginNavigationProp>();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(nextUser => {
      setUser(nextUser);
      setInitializing(false);
    });

    return subscriber;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (user) {
      navigation.navigate('Catalog');
    }
  }, [navigation, user]);

  const renderCenterView = () => {
    if (initializing) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.GREEN} />
        </View>
      );
    }

    return (
      <View style={styles.center}>
        <IBMText style={styles.basicText}>
          Sign In to Track Your Progress
        </IBMText>
        <GoogleSigninButton />
        <AppleSigninButton />
        <IBMText style={styles.basicText}>or</IBMText>
        <PressStartText
          onPress={() => navigation.navigate('Catalog')}
          style={[styles.continueText, styles.textShadow]}>
          Continue
        </PressStartText>
      </View>
    );
  };

  return (
    <ImageBackground source={loginBackground} style={styles.backdrop}>
      <View style={styles.container}>
        <View style={styles.top}>
          <GradientText
            gradientProps={{
              colors: [Colors.GREEN, Colors.GREEN, Colors.RED],
            }}
            textProps={{
              children: 'Retro Fighter',
              style: styles.title,
            }}
          />
        </View>
        <View style={styles.preview}>
          <CraftPreview />
        </View>
        {renderCenterView()}
        <View style={styles.bottom} />
      </View>
    </ImageBackground>
  );
};

export default Login;
