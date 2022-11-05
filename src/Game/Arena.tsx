import React from 'react';
import {StyleSheet, View} from 'react-native';
import Colors from 'types/colors';

import Fighter from './Fighter';
import {useEnemyFactoryContext} from './enemy/EnemyFactoryContext';
import {useEliminationContext} from './Fighter/EliminationContext';

import {
  alleyWidth,
  arenaSize,
  numColumns,
  seperatorWidth,
  totalWidth,
} from './constants';

const styles = StyleSheet.create({
  arena: {
    width: arenaSize,
    height: arenaSize,
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

const Arena = (): JSX.Element => {
  const enemies = useEnemyFactoryContext();
  const {remainingLives} = useEliminationContext();

  return (
    <View style={styles.arena}>
      <View>
        {enemies.map((enemy, i) => {
          if (enemy === null) {
            return null;
          }

          const {key, Enemy, hasEliminationAnimationEnded, ...rest} = enemy;

          if (rest.isEliminated && hasEliminationAnimationEnded) {
            return null;
          }

          return <Enemy key={key} startingLeft={totalWidth * i} {...rest} />;
        })}
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
