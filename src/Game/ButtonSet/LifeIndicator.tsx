import React from 'react';
import {StyleSheet, View} from 'react-native';

import Colors from 'types/colors';
import FighterIcon from 'icons/spaceship.svg';

import {craftSize} from '../constants';

const styles = StyleSheet.create({
  iconContainer: {
    height: craftSize,
    width: craftSize,
    margin: 4,
  },
  shadow: {
    position: 'absolute',
    zIndex: -1,
    top: 4,
    left: 2,
  },
});

const LifeIndicator = (): JSX.Element => {
  return (
    <View style={styles.iconContainer}>
      <FighterIcon fill={Colors.GREEN} />
      <FighterIcon fill="#00000040" style={styles.shadow} />
    </View>
  );
};

export default LifeIndicator;
