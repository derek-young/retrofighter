import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

const styles = StyleSheet.create({
  arena: {
    flexBasis: '50%',
    backgroundColor: 'lightgreen',
  },
});

type ArenaProps = {};

const Arena = (): JSX.Element => {
  return (
    <View style={styles.arena}>
      <Text>Arena</Text>
    </View>
  );
};

export default Arena;
