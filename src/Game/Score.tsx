import React, {useEffect, useRef, useState} from 'react';
import {Animated, StyleSheet} from 'react-native';

import Colors from 'types/colors';
import PressStartText from 'components/PressStartText';

import {scorePersistMs} from './GameContext';

const styles = StyleSheet.create({
  score: {
    shadowOffset: {width: 2, height: 2},
    position: 'absolute',
    shadowColor: 'black',
    shadowOpacity: 0.4,
  },
});

const easeDurationMs = 800;
const startingRight = -100;

interface ScoreProps {
  score: number;
  top: number;
}

const Score = ({score, top}: ScoreProps) => {
  const topValue = useRef(top);
  const rightAnim = useRef(new Animated.Value(startingRight));
  const [rightValue, setRightValue] = useState(startingRight);

  useEffect(() => {
    rightAnim.current.addListener(({value}: {value: number}) =>
      setRightValue(value),
    );
  }, []);

  useEffect(() => {
    const easeOut = () => {
      Animated.timing(rightAnim.current, {
        toValue: startingRight,
        duration: easeDurationMs,
        useNativeDriver: true,
      }).start();
    };

    const easeIn = () => {
      Animated.timing(rightAnim.current, {
        toValue: 32,
        duration: easeDurationMs,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(easeOut, scorePersistMs - easeDurationMs * 2);
      });
    };

    easeIn();
  }, []);

  return (
    <PressStartText
      style={[
        styles.score,
        {
          color: score > 0 ? Colors.GREEN : Colors.RED,
          top: topValue.current,
          right: rightValue,
        },
      ]}>
      {score > 0 ? `+${score}` : score}
    </PressStartText>
  );
};

export default Score;
