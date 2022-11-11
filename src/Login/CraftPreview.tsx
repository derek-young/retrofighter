import React from 'react';
import {StyleSheet, View} from 'react-native';

import Colors from 'types/colors';
import FighterIcon from 'icons/spaceship.svg';
import DualFighterIcon from 'icons/enemy-plane.svg';
import MissileIcon from 'icons/missile.svg';

const previewSize = 40;

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  iconContainer: {
    height: previewSize,
    width: previewSize,
  },
  shadow: {
    position: 'absolute',
    zIndex: -1,
    top: 4,
    left: 2,
  },
  missile: {
    position: 'absolute',
    height: previewSize * 0.6,
    width: previewSize * 0.6,
    transform: [{rotate: '-45deg'}],
  },
  missileLeft: {
    left: -5,
    bottom: 4,
  },
  missileRight: {
    right: -5,
    bottom: 72,
  },
  fastGreen: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    width: previewSize,
    position: 'absolute',
    bottom: -24,
    opacity: 0.6,
  },
  fastRed: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    height: previewSize,
    position: 'absolute',
    left: -32,
    opacity: 0.6,
    transform: [{rotate: '90deg'}],
  },
  bar: {
    height: 12,
    borderRadius: 2,
    width: 3,
    backgroundColor: Colors.GREEN,
    margin: 2,
  },
  barRed: {
    backgroundColor: Colors.RED,
  },
});

const FastGreen = () => (
  <View style={styles.fastGreen}>
    <View style={styles.bar} />
    <View style={[styles.bar, {marginTop: 6}]} />
    <View style={styles.bar} />
  </View>
);

const FastRed = () => (
  <View style={styles.fastRed}>
    <View style={[styles.bar, {backgroundColor: Colors.RED}]} />
    <View style={[styles.bar, {backgroundColor: Colors.RED, marginTop: 6}]} />
    <View style={[styles.bar, {backgroundColor: Colors.RED}]} />
  </View>
);

const CraftPreview = () => {
  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, {transform: [{rotate: '90deg'}]}]}>
        <MissileIcon
          fill={Colors.GREEN}
          style={[styles.missile, styles.missileLeft]}
        />
        <FighterIcon fill={Colors.GREEN} />
        <FighterIcon fill="#00000040" style={styles.shadow} />
        <MissileIcon
          fill={Colors.GREEN}
          style={[styles.missile, styles.missileRight]}
        />
        <FastGreen />
      </View>
      <View style={styles.iconContainer}>
        <View style={{transform: [{rotate: '45deg'}]}}>
          <DualFighterIcon fill={Colors.RED} />
          <DualFighterIcon fill="#00000040" style={styles.shadow} />
        </View>
        <FastRed />
      </View>
    </View>
  );
};

export default CraftPreview;
