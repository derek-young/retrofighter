import React from 'react';
import {StyleSheet, View} from 'react-native';

import Colors from 'types/colors';

import Arena from './Arena';
import ButtonSet from './ButtonSet';
import DPad from './DPad';

const PADDING = 56;

const styles = StyleSheet.create({
  game: {
    flex: 1,
    flexDirection: 'row',
    paddingLeft: PADDING,
    paddingRight: PADDING,
    backgroundColor: Colors.PURPLE,
  },
});

const Game = (): JSX.Element => {
  return (
    <View style={styles.game}>
      <DPad padding={PADDING} />
      <Arena />
      <ButtonSet padding={PADDING} />
    </View>
  );
};

export default Game;
