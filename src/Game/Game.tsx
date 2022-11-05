import React, {useState} from 'react';
import {ImageBackground, Pressable, StyleSheet, View} from 'react-native';
import {RouteProp} from '@react-navigation/native';

import {RootStackParamList} from 'types/app';
import Colors from 'types/colors';
import backgroundImage from 'images/backdrop.jpg';
import IBMText from 'components/IBMText';

import Arena from './Arena';
import ButtonSet from './ButtonSet';
import DPad from './DPad';
import {GameProvider} from './GameContext';
import {AnimationProvider} from './Fighter/AnimationContext';
import {EliminationProvider} from './Fighter/EliminationContext';
import {MissileProvider} from './Fighter/MissileContext';
import {EnemyFactoryProvider} from './enemy/EnemyFactoryContext';
import PauseMenu from './PauseMenu';

type GameRouteParam = RouteProp<RootStackParamList, 'Game'>;

type GameProps = {
  route?: GameRouteParam;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  game: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  pauseButtonContainer: {
    position: 'absolute',
    left: 20,
    top: 20,
  },
  pauseButton: {
    borderRadius: 20,
    padding: 10,
    backgroundColor: Colors.LIGHT_PINK,
    shadowColor: 'black',
    shadowOffset: {width: 2, height: 2},
    shadowOpacity: 0.4,
  },
});

const Game = ({route}: GameProps): null | JSX.Element => {
  const [isPaused, setIsPaused] = useState(false);
  const [uniqueKey, setUniqueKey] = useState(Date.now());
  const epic = route?.params?.epic ?? 0;

  return (
    <View style={styles.container}>
      <ImageBackground
        key={uniqueKey}
        source={backgroundImage}
        style={styles.container}>
        <GameProvider isPaused={isPaused}>
          <AnimationProvider>
            <EliminationProvider>
              <MissileProvider>
                <EnemyFactoryProvider epic={epic}>
                  <View style={styles.game}>
                    <DPad />
                    <Arena />
                    <ButtonSet />
                    <View style={styles.pauseButtonContainer}>
                      <Pressable
                        style={styles.pauseButton}
                        onPress={() => setIsPaused(true)}>
                        <IBMText>Game Menu</IBMText>
                      </Pressable>
                    </View>
                  </View>
                </EnemyFactoryProvider>
              </MissileProvider>
            </EliminationProvider>
          </AnimationProvider>
        </GameProvider>
      </ImageBackground>
      <PauseMenu
        onClose={() => setIsPaused(false)}
        onReset={() => setUniqueKey(Date.now())}
        open={isPaused}
      />
    </View>
  );
};

export default Game;
