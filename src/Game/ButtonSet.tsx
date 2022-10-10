import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

const styles = StyleSheet.create({
  buttonSet: {
    flex: 1,
  },
});

const ButtonSet = (): JSX.Element => {
  return (
    <View style={styles.buttonSet}>
      <Text>ButtonSet</Text>
    </View>
  );
};

export default ButtonSet;
