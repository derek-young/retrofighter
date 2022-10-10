import React from 'react';
import {StyleSheet, View} from 'react-native';
import {RouteProp} from '@react-navigation/native';

import {RootStackParamList} from 'types/app';
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

type GameRouteParam = RouteProp<RootStackParamList, 'Game'>;

type GameProps = {
  route?: GameRouteParam;
};

const Game = ({route}: GameProps): JSX.Element => {
  const epic = route?.params?.epic;
  console.log('epic', epic);

  return (
    <View style={styles.game}>
      <DPad padding={PADDING} />
      <Arena />
      <ButtonSet padding={PADDING} />
    </View>
  );
};

export default Game;
