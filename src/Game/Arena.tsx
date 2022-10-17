import React from 'react';
import {StyleSheet, View} from 'react-native';
import Colors from 'types/colors';

import {DualFighter, Bomber} from './enemy';
import {EnemyProvider} from './enemy/EnemyContext';
import Fighter from './Fighter';

import {
  alleyWidth,
  numColumns,
  seperatorWidth,
  windowHeight,
} from './gameConstants';

const styles = StyleSheet.create({
  arena: {
    width: windowHeight,
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
  <View style={{...styles.seperator, ...props}} />
);

const Arena = (): JSX.Element => {
  return (
    <View style={styles.arena}>
      <EnemyProvider>
        <View>
          <Bomber startingLeft={33.7} />
          <DualFighter />
        </View>
      </EnemyProvider>
      <Fighter />
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
