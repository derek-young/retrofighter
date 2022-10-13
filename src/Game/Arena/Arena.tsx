import React, {useState} from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';
import Colors from 'types/colors';

import EnemyFighter from './EnemyFighter';
import Fighter from './Fighter';
import {CRAFT_SIZE} from './Craft';

const columnHeight = CRAFT_SIZE + 2;
const numColumns = 12;
const windowHeight = Dimensions.get('window').height;
const seperatorHeight = (windowHeight - numColumns * columnHeight) / 11;

const styles = StyleSheet.create({
  arena: {
    width: windowHeight,
    backgroundColor: Colors.PINK,
  },
  seperator: {
    position: 'absolute',
    backgroundColor: Colors.GREY,
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

type ArenaProps = {};

const Arena = (): JSX.Element => {
  return (
    <View style={styles.arena}>
      {new Array(numColumns - 1)
        .fill(0)
        .map((y, i) =>
          new Array(numColumns - 1)
            .fill(0)
            .map((x, j) => (
              <Seperator
                top={columnHeight * (i + 1) + seperatorHeight * i}
                left={columnHeight * (j + 1) + seperatorHeight * j}
                height={seperatorHeight}
                width={seperatorHeight}
              />
            )),
        )}
      <EnemyFighter facing="S" top={0} left={0} />
      <Fighter
        facing="N"
        top={columnHeight + seperatorHeight}
        left={columnHeight + seperatorHeight}
      />
    </View>
  );
};

export default Arena;
