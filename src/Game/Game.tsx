import React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';

import Arena from './Arena';
import ButtonSet from './ButtonSet';
import DPad from './DPad';

const styles = StyleSheet.create({
  game: {
    display: 'flex',
    flexDirection: 'row',
  },
});

const Game = (): JSX.Element => {
  return (
    <SafeAreaView style={styles.game}>
      <DPad />
      <Arena />
      <ButtonSet />
    </SafeAreaView>
  );
};

export default Game;
