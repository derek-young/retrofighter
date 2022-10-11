import React from 'react';
import {StyleSheet, View} from 'react-native';
import Colors from 'types/colors';

import EnemyFighter from './EnemyFighter';
import Fighter from './Fighter';

const styles = StyleSheet.create({
  arena: {
    flexBasis: '50%',
    backgroundColor: Colors.PINK,
  },
});

type ArenaProps = {};

const Arena = (): JSX.Element => {
  return (
    <View style={styles.arena}>
      <Fighter facing="N" />
      <Fighter facing="E" />
      <Fighter facing="S" />
      <Fighter facing="W" />
      <EnemyFighter facing="N" />
      <EnemyFighter facing="E" />
      <EnemyFighter facing="S" />
      <EnemyFighter facing="W" />
    </View>
  );
};

export default Arena;
