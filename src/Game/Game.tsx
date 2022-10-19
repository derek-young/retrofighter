import React from 'react';
import {ImageBackground, StyleSheet, View} from 'react-native';
import {RouteProp} from '@react-navigation/native';

import {RootStackParamList} from 'types/app';
import backgroundImage from 'images/backdrop.jpg';

import Arena from './Arena';
import ButtonSet from './ButtonSet';
import DPad from './DPad';
import {AnimationProvider} from './Fighter/AnimationContext';
import {EliminationProvider} from './Fighter/EliminationContext';
import {leftRightPadding} from './gameConstants';

type GameRouteParam = RouteProp<RootStackParamList, 'Game'>;

type GameProps = {
  route?: GameRouteParam;
};

const styles = StyleSheet.create({
  game: {
    flex: 1,
    flexDirection: 'row',
    paddingLeft: leftRightPadding,
    paddingRight: leftRightPadding,
  },
  backdrop: {
    flex: 1,
  },
});

const Game = ({route}: GameProps): JSX.Element => {
  const epic = route?.params?.epic;
  console.log('epic', epic);

  return (
    <ImageBackground source={backgroundImage} style={styles.backdrop}>
      <AnimationProvider>
        <EliminationProvider>
          <View style={styles.game}>
            <DPad />
            <Arena />
            <ButtonSet />
          </View>
        </EliminationProvider>
      </AnimationProvider>
    </ImageBackground>
  );
};

export default Game;
