import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

const styles = StyleSheet.create({
  arena: {
    flex: 2,
  },
});

const Arena = (): JSX.Element => {
  return (
    <View style={styles.arena}>
      <Text>Arena</Text>
    </View>
  );
};

export default Arena;
