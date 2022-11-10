import React, {useEffect, useState} from 'react';
import {ImageBackground, StyleSheet, View} from 'react-native';
import {RouteProp} from '@react-navigation/native';

import {GameNavigationProp, RootStackParamList} from 'types/app';
import backgroundImageLvl1 from 'images/backdrop_level_1.jpg';
import backgroundImageLvl2 from 'images/backdrop_level_2.jpg';
import backgroundImageLvl3 from 'images/backdrop_level_3.jpg';
import backgroundImageLvl4 from 'images/backdrop_level_4.jpg';
import backgroundImageLvl5 from 'images/backdrop_level_5.jpg';
import Button from 'components/Button';

import Arena from './Arena';
import ButtonSet from './ButtonSet';
import DPad from './DPad';
import LevelCompletePopup from './LevelCompletePopup';
import LevelFailedPopup from './LevelFailedPopup';
import PauseMenu from './PauseMenu';
import Score from './Score';
import {GameProvider, useGameContext} from './GameContext';
import {AnimationProvider} from './Fighter/AnimationContext';
import {EliminationProvider} from './Fighter/EliminationContext';
import {MissileProvider} from './Fighter/MissileContext';
import {EnemyFactoryProvider} from './enemy/EnemyFactoryContext';

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
});

function getBackgroundImage(epic: number) {
  switch (epic) {
    case 0:
      return backgroundImageLvl1;
    case 1:
      return backgroundImageLvl2;
    case 2:
      return backgroundImageLvl3;
    case 3:
      return backgroundImageLvl4;
    case 4:
      return backgroundImageLvl5;
    default:
      return backgroundImageLvl1;
  }
}

interface GameViewProps {
  onReset: () => void;
}

const GameView = ({onReset}: GameViewProps) => {
  const {pendingScores, setIsPaused} = useGameContext();

  return (
    <View style={styles.game}>
      <DPad />
      <Arena />
      <ButtonSet />
      <View style={styles.pauseButtonContainer}>
        <Button onPress={() => setIsPaused(true)}>Menu</Button>
      </View>
      <PauseMenu onReset={onReset} />
      <LevelCompletePopup onReset={onReset} />
      <LevelFailedPopup onReset={onReset} />
      {pendingScores.map((score, i) => (
        <Score key={i} score={score} top={(i + 1) * 20} />
      ))}
    </View>
  );
};

type GameRouteParam = RouteProp<RootStackParamList, 'Game'>;

type GameProps = {
  navigation?: GameNavigationProp;
  route?: GameRouteParam;
};

const Game = ({navigation, route}: GameProps): null | JSX.Element => {
  const [uniqueKey, setUniqueKey] = useState(Date.now());
  const epic = route?.params?.epic ?? 0;

  useEffect(() => {
    const unsubscribe = navigation?.addListener('blur', () => {
      setUniqueKey(Date.now());
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <GameProvider epic={epic}>
      <View style={styles.container}>
        <ImageBackground
          key={uniqueKey}
          source={getBackgroundImage(epic)}
          style={styles.container}>
          <AnimationProvider>
            <EliminationProvider>
              <MissileProvider>
                <EnemyFactoryProvider>
                  <GameView onReset={() => setUniqueKey(Date.now())} />
                </EnemyFactoryProvider>
              </MissileProvider>
            </EliminationProvider>
          </AnimationProvider>
        </ImageBackground>
      </View>
    </GameProvider>
  );
};

export default Game;
