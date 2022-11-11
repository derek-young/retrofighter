import React, {useEffect, useRef, useState} from 'react';
import {Animated, StyleSheet, View} from 'react-native';
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
    color: Colors.RED,
    shadowColor: 'black',
    shadowOpacity: 0.4,
  },
  buttonHolder: {
    display: 'flex',
    flexDirection: 'row',
    minHeight: 38,
    marginVertical: 16,
  },
  button: {
    marginHorizontal: 8,
  },
});

const LevelFailedPopup = ({onReset}: {onReset: () => void}) => {
  const {remainingLives, setRemainingLives} = useGameContext();
  const enemies = useEnemyFactoryContext();
  const fontAnimation = useRef(new Animated.Value(0));
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState(0);
  const [showButtons, setShowButtons] = useState(false);

  const areAllEnemiesEliminated = enemies.every(
    e => e === null || e.isEliminated,
  );

  useEffect(() => {
    if (!areAllEnemiesEliminated && remainingLives < 0) {
      setTimeout(() => setIsOpen(true), 1000);
    }
  }, [areAllEnemiesEliminated, remainingLives]);

  useEffect(() => {
    fontAnimation.current.addListener(({value}) => setFontSize(value));
  }, []);

  useEffect(() => {
    const onFontAnimEnd = () => setShowButtons(true);

    if (isOpen) {
      Animated.timing(fontAnimation.current, {
        toValue: 80,
        duration: 1000,
        useNativeDriver: true,
      }).start(onFontAnimEnd);
    }
  }, [isOpen]);

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
          GAME OVER
        </PressStartText>
        <View style={styles.buttonHolder}>
          {showButtons && (
            <>
              <ExitLevelButton />
              <Button
                onPress={() => {
                  setRemainingLives(1);
                  onReset();
                }}
                style={styles.button}>
                Retry Level
              </Button>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default LevelFailedPopup;
