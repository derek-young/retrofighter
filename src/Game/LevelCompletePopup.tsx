import React, {useEffect, useRef, useState} from 'react';
import {Animated, StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {userActions} from 'database';
import {GameNavigationProp} from 'types/app';
import Colors from 'types/colors';
import Button from 'components/Button';
import Modal from 'components/Modal';
import PressStartText from 'components/PressStartText';

import {useEnemyFactoryContext} from './enemy/EnemyFactoryContext';
import {useGameContext} from './GameContext';
import ExitLevelButton from './ExitLevelButton';

const styles = StyleSheet.create({
  modal: {
    backgroundColor: '#00000060',
  },
  container: {
    display: 'flex',
    alignItems: 'center',
  },
  bannerText: {
    color: Colors.GREEN,
    shadowColor: 'black',
    shadowOpacity: 0.4,
  },
  scoreContainer: {
    marginVertical: 16,
    backgroundColor: '#FFFFFF20',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  score: {
    color: Colors.PINK,
    fontSize: 32,
    shadowColor: 'black',
    shadowOpacity: 0.6,
    shadowOffset: {width: 4, height: 4},
  },
  buttonHolder: {
    display: 'flex',
    flexDirection: 'row',
    minHeight: 38,
  },
  button: {
    marginHorizontal: 8,
  },
});

const LevelCompletePopup = ({onReset}: {onReset: () => void}) => {
  const navigation = useNavigation<GameNavigationProp>();
  const {epic, totalScore, setRemainingLives} = useGameContext();
  const enemies = useEnemyFactoryContext();
  const fontAnimation = useRef(new Animated.Value(0));
  const scoreAnimation = useRef(new Animated.Value(0));
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState(0);
  const [score, setScore] = useState(0);
  const [haveAnimationsEnded, setHaveAnimationsEnded] = useState(false);

  const areAllEnemiesEliminated = enemies.every(
    e => e === null || e.isEliminated,
  );

  useEffect(() => {
    if (areAllEnemiesEliminated) {
      setTimeout(() => setIsOpen(true), 1000);
    }
  }, [areAllEnemiesEliminated]);

  useEffect(() => {
    fontAnimation.current.addListener(({value}) => setFontSize(value));
    scoreAnimation.current.addListener(({value}) =>
      setScore(Math.round(value)),
    );
  }, []);

  useEffect(() => {
    const onScoreAnimEnd = () => {
      setHaveAnimationsEnded(true);
      setRemainingLives(l => l + 1);
    };

    if (isOpen) {
      Animated.timing(fontAnimation.current, {
        toValue: 80,
        duration: 1000,
        useNativeDriver: true,
      }).start();

      Animated.timing(scoreAnimation.current, {
        toValue: totalScore,
        duration: 2000,
        useNativeDriver: true,
      }).start(onScoreAnimEnd);
    }
  }, [isOpen, setRemainingLives, totalScore]);

  useEffect(() => {
    const recordHighScore = async () => {
      const user = await userActions.get();
      const highScore = user?.highScore ?? 0;

      if (highScore < totalScore) {
        userActions.set({highScore: totalScore});
      }
    };

    if (haveAnimationsEnded && isOpen) {
      recordHighScore();
    }
  }, [haveAnimationsEnded, isOpen, totalScore]);

  if (!isOpen) {
    return null;
  }

  return (
    <Modal open={isOpen} style={styles.modal}>
      <View style={styles.container}>
        <PressStartText
          style={[
            styles.bannerText,
            {
              fontSize,
              shadowOffset: {
                width: fontSize / 5,
                height: fontSize / 5,
              },
            },
          ]}>
          VICTORY
        </PressStartText>
        <View style={styles.scoreContainer}>
          {score !== 0 && (
            <PressStartText style={styles.score}>{score}</PressStartText>
          )}
        </View>
        <View style={styles.buttonHolder}>
          {haveAnimationsEnded && (
            <>
              <ExitLevelButton />
              <Button
                onPress={() => {
                  navigation.navigate('Game', {epic: epic + 1});
                  onReset();
                }}
                style={styles.button}>
                Next Level
              </Button>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default LevelCompletePopup;
