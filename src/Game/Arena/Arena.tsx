import React from 'react';
import {Animated, StyleSheet, View} from 'react-native';
import Colors from 'types/colors';

import EnemyFighter from './EnemyFighter';
import Fighter from './Fighter';
import {Facing} from '../types';

import {
  alleyWidth,
  numColumns,
  seperatorWidth,
  windowHeight,
} from '../gameConstants';

const styles = StyleSheet.create({
  arena: {
    width: windowHeight,
    backgroundColor: Colors.PINK,
  },
  seperator: {
    position: 'absolute',
    backgroundColor: '#FFF',
    borderRadius: 2,
    shadowColor: 'black',
    shadowOffset: {width: 2, height: 2},
    shadowOpacity: 0.4,
  },
});

type SeperatorProps = {
  top: number;
  left: number;
  width: number;
  height: number;
};

const Seperator = (props: SeperatorProps) => (
  <View style={{...styles.seperator, ...props}} />
);

type ArenaProps = {
  facing: Facing;
  topAnim: Animated.Value;
  leftAnim: Animated.Value;
};

const Arena = ({topAnim, leftAnim, facing}: ArenaProps): JSX.Element => {
  return (
    <View style={styles.arena}>
      {new Array(numColumns - 1)
        .fill(0)
        .map((y, i) =>
          new Array(numColumns - 1)
            .fill(0)
            .map((x, j) => (
              <Seperator
                key={i + j}
                top={alleyWidth * (i + 1) + seperatorWidth * i}
                left={alleyWidth * (j + 1) + seperatorWidth * j}
                height={seperatorWidth}
                width={seperatorWidth}
              />
            )),
        )}
      <EnemyFighter facing={'S'} top={0} left={0} />
      <Fighter facing={facing} top={topAnim} left={leftAnim} />
    </View>
  );
};

export default Arena;
