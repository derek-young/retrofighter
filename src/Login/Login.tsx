import React, {useEffect, useState} from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';

import Colors from 'types/colors';
import {LoginNavigationProp} from 'types/app';
import GradientText from 'components/GradientText';
import IBMText from 'components/IBMText';
import PressStartText from 'components/PressStartText';

import GoogleSigninButton from './GoogleSigninButton';
import {useAppContext} from 'AppContext';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 32,
  },
  top: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  center: {
    flex: 2,
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
        <IBMText style={styles.basicText}>Sign In to Track Your Scores</IBMText>
        <GoogleSigninButton />
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
      {renderCenterView()}
      <View style={styles.bottom} />
    </View>
  );
};

export default Login;
