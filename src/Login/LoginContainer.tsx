import React from 'react';
import {SafeAreaView, StatusBar, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import Colors from 'types/colors';

import Login from './Login';

const styles = StyleSheet.create({
  upperSafeView: {
    flex: 0,
    backgroundColor: Colors.DEEP_PURPLE,
  },
  gradient: {
    flex: 1,
  },
  lowerSafeView: {
    flex: 1,
    backgroundColor: Colors.PURPLE,
  },
});

const LoginContainer: React.FC = (): JSX.Element => {
  return (
    <>
      <SafeAreaView style={styles.upperSafeView} />
      <SafeAreaView style={styles.lowerSafeView}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          style={styles.gradient}
          colors={[Colors.DEEP_PURPLE, Colors.PINK, Colors.PURPLE]}>
          <Login />
        </LinearGradient>
      </SafeAreaView>
    </>
  );
};

export default LoginContainer;
