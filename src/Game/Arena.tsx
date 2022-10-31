import React from 'react';
import {StyleSheet, View} from 'react-native';
import Colors from 'types/colors';

import {DualFighter, EnemyUAV} from './enemy';
import Fighter from './Fighter';
import {useEliminationContext} from './Fighter/EliminationContext';

import {
  alleyWidth,
  arenaSize,
  numColumns,
  seperatorWidth,
  totalWidth,
} from './gameConstants';

const styles = StyleSheet.create({
  arena: {
    width: arenaSize,
    backgroundColor: `${Colors.PINK}40`,
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
  <View style={{...styles.seperator, ...props}}>
    {/* Debugger */}
    {/* <Text
      style={{
        position: 'absolute',
        width: 30,
      }}>
      {Math.round(props.top)}
    </Text>
    <Text
      style={{
        position: 'absolute',
        top: 15,
        width: 30,
      }}>
      {Math.round(props.left)}
    </Text> */}
  </View>
);

const startingEnemies = [
  DualFighter,
  DualFighter,
  DualFighter,
  DualFighter,
  EnemyUAV,
  EnemyUAV,
  EnemyUAV,
  EnemyUAV,
];

const Arena = (): JSX.Element => {
  const {remainingLives} = useEliminationContext();

  return (
    <View style={styles.arena}>
      <View>
        {startingEnemies.map((Enemy, i) => (
          <Enemy key={i} startingLeft={totalWidth * (i + 1)} />
        ))}
      </View>
      <Fighter key={remainingLives} />
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
    </View>
  );
};

export default Arena;
