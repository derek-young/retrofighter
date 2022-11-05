import React, {useState} from 'react';
import {Button, ImageBackground, StyleSheet, Text, View} from 'react-native';
import {RouteProp} from '@react-navigation/native';

import {RootStackParamList} from 'types/app';
import backgroundImage from 'images/backdrop.jpg';

import Arena from './Arena';
import ButtonSet from './ButtonSet';
import DPad from './DPad';
import {AnimationProvider} from './Fighter/AnimationContext';
import {EliminationProvider} from './Fighter/EliminationContext';
import {MissileProvider} from './Fighter/MissileContext';
import {EnemyFactoryProvider} from './enemy/EnemyFactoryContext';

type GameRouteParam = RouteProp<RootStackParamList, 'Game'>;

type GameProps = {
  route?: GameRouteParam;
};

const styles = StyleSheet.create({
  game: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  backdrop: {
    flex: 1,
  },
  resetButton: {
    position: 'absolute',
    left: 20,
  },
  version: {
    position: 'absolute',
    left: 30,
    top: 30,
  },
});

const Game = ({route}: GameProps): null | JSX.Element => {
  const [uniqueKey, setUniqueKey] = useState(Date.now());
  const epic = route?.params?.epic ?? 0;

  return (
    <ImageBackground
      key={uniqueKey}
      source={backgroundImage}
      style={styles.backdrop}>
      <AnimationProvider>
        <EliminationProvider>
          <MissileProvider>
            <EnemyFactoryProvider epic={epic}>
              <View style={styles.game}>
                <DPad />
                <Arena />
                <ButtonSet />
                <View style={styles.resetButton}>
                  <Button
                    onPress={() => {
                      setUniqueKey(Date.now());
                    }}
                    title="Reset"
                  />
                </View>
                <View style={styles.version}>
                  <Text style={{color: 'red'}}>v.1.5</Text>
                </View>
              </View>
            </EnemyFactoryProvider>
          </MissileProvider>
        </EliminationProvider>
      </AnimationProvider>
    </ImageBackground>
  );
};

export default Game;
