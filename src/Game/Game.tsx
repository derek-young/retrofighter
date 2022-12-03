import React, {useCallback, useEffect, useState} from 'react';
import {ImageBackground, StyleSheet, View} from 'react-native';
import {RouteProp} from '@react-navigation/native';

import {GameNavigationProp, RootStackParamList} from 'types/app';
import backgroundImageLvl1 from 'images/backdrop_level_1.jpg';
import backgroundImageLvl2 from 'images/backdrop_level_2.jpg';
import backgroundImageLvl3 from 'images/backdrop_level_3.jpg';
import backgroundImageLvl4 from 'images/backdrop_level_4.jpg';
import backgroundImageLvl5 from 'images/backdrop_level_5.jpg';
import backgroundImageLvl6 from 'images/backdrop_level_6.jpg';
import backgroundImageLvl7 from 'images/backdrop_level_7.jpg';
import backgroundImageLvl8 from 'images/backdrop_level_8.jpg';
import backgroundImageLvl9 from 'images/backdrop_level_9.jpg';
import backgroundImageLvl10 from 'images/backdrop_level_10.jpg';
import Button from 'components/Button';

import Arena from './Arena';
import ButtonSet from './ButtonSet';
import DPad from './DPad';
import LevelCompletePopup from './LevelCompletePopup';
import LevelFailedPopup from './LevelFailedPopup';
import PauseMenu from './PauseMenu';
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
    case 5:
      return backgroundImageLvl6;
    case 6:
      return backgroundImageLvl7;
    case 7:
      return backgroundImageLvl8;
    case 8:
      return backgroundImageLvl9;
    case 9:
      return backgroundImageLvl10;
    default:
      return backgroundImageLvl1;
  }
}

interface GameViewProps {
  onResetBoard: () => void;
}

const GameView = ({onResetBoard}: GameViewProps) => {
  const {resetGameContext, setIsPaused} = useGameContext();

  const onResetLevel = useCallback(() => {
    onResetBoard();
    resetGameContext();
  }, [onResetBoard, resetGameContext]);

  return (
    <View style={styles.game}>
      <DPad />
      <Arena />
      <ButtonSet />
      <View style={styles.pauseButtonContainer}>
        <Button onPress={() => setIsPaused(true)}>Menu</Button>
      </View>
      <PauseMenu onResetLevel={onResetLevel} />
      <LevelCompletePopup
        onResetBoard={onResetBoard}
        onResetLevel={onResetLevel}
      />
      <LevelFailedPopup onResetLevel={onResetLevel} />
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

  const onResetBoard = useCallback(() => setUniqueKey(Date.now()), []);

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
                  <GameView onResetBoard={onResetBoard} />
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
