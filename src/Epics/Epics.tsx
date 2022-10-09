import React from 'react';
import {SafeAreaView, StyleSheet, TouchableOpacity, View} from 'react-native';

import PressStartText from 'components/PressStartText';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#7A04EB',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D9D9D9',
    borderWidth: 8,
    borderRadius: 4,
    borderColor: '#7A04EB60',
    width: 160,
    height: 56,
    margin: 12,
  },
});

const EpicButton = ({children}: {children: string}): JSX.Element => (
  <TouchableOpacity style={styles.button}>
    <PressStartText>{children}</PressStartText>
  </TouchableOpacity>
);

const Epics = (): JSX.Element => (
  <SafeAreaView style={styles.container}>
    <EpicButton>Epic 1</EpicButton>
    <EpicButton>Epic 2</EpicButton>
  </SafeAreaView>
);

export default Epics;
