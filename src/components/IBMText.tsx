import React from 'react';
import {StyleSheet, Text, TextProps} from 'react-native';

const styles = StyleSheet.create({
  appText: {
    fontFamily: 'IBMPlexMono-Regular',
  },
});

const IBMText = ({style = {}, ...rest}: TextProps): JSX.Element => (
  <Text style={[styles.appText, style]} {...rest} />
);

export default IBMText;
