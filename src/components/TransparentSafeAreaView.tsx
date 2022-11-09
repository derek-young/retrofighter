import React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  transparent: {
    opacity: 0,
  },
});

const TransparentSafeAreaView = () => (
  <SafeAreaView style={styles.transparent} />
);

export default TransparentSafeAreaView;
