import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7A04EB',
  },
});

const Epics = (): JSX.Element => (
  <View style={styles.container}>
    <Text>Epics</Text>
  </View>
);

export default Epics;
