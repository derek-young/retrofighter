import React from 'react';
import {StyleSheet, View} from 'react-native';

import Login from './Login';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7A04EB',
  },
});

const App = (): JSX.Element => {
  return (
    <View style={styles.container}>
      <Login />
    </View>
  );
};

export default App;
