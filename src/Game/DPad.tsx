import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

const styles = StyleSheet.create({
  dPad: {
    flex: 1,
  },
});

const DPad = (): JSX.Element => {
  return (
    <View style={styles.dPad}>
      <Text>DPad</Text>
    </View>
  );
};

export default DPad;
