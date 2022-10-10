import React from 'react';
import {StyleSheet, View} from 'react-native';

import Colors from 'types/colors';
import FighterIcon from 'icons/spaceship.svg';

const styles = StyleSheet.create({
  iconContainer: {
    height: 20,
    width: 20,
    // position: 'absolute',
    // top: 0,
    // left: 0,
  },
  shadow: {
    position: 'absolute',
    top: 4,
    left: 2,
    zIndex: -1,
  },
});

const Fighter = (): JSX.Element => {
  return (
    <View style={styles.iconContainer}>
      <FighterIcon fill={Colors.GREEN} />
      <FighterIcon fill="#00000040" style={styles.shadow} />
    </View>
  );
};

export default Fighter;
