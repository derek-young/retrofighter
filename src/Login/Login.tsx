import React from 'react';
import {Button, StyleSheet, View} from 'react-native';

import Colors from 'types/colors';
import GradientText from 'components/GradientText';
import IBMText from 'components/IBMText';
import PressStartText from 'components/PressStartText';

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
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 40,
    textAlign: 'center',
    fontFamily: 'PressStart2P-Regular',
  },
  continueText: {
    fontSize: 24,
    color: Colors.GREEN,
  },
});

const Login = (): JSX.Element => {
  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <GradientText
          gradientProps={{
            colors: [Colors.GREEN, Colors.RED],
          }}
          textProps={{
            children: 'Retro Fighter',
            style: styles.title,
          }}
        />
      </View>
      <View style={styles.center}>
        <IBMText>Sign In to Track Scores</IBMText>
        <Button title="Sign In with Facebook" />
        <Button title="Sign In with Google" />
        <Button title="Sign In with Apple" />
      </View>
      <View style={styles.bottom}>
        <IBMText>or</IBMText>
        <PressStartText style={styles.continueText}>Continue</PressStartText>
      </View>
    </View>
  );
};

export default Login;
