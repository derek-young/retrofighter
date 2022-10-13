import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Colors from 'types/colors';

import EnemyFighter from './Arena/EnemyFighter';
import Fighter from './Arena/Fighter';

const styles = StyleSheet.create({
  buttonSet: {
    flexBasis: '25%',
  },
  section: {
    flex: 1,
  },
  top: {
    display: 'flex',
    flexDirection: 'row',
  },
  middle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    width: 48,
    borderRadius: 24,
    backgroundColor: Colors.RED,
    margin: 12,
    shadowColor: 'black',
    shadowOffset: {width: 2, height: 2},
    shadowOpacity: 0.4,
  },
  buttonText: {
    color: 'white',
    fontSize: 24,
  },
});

type ActionButtonProps = {
  children: string;
  onPress: () => void;
};

const ActionButton = ({children, onPress}: ActionButtonProps): JSX.Element => (
  <TouchableOpacity onPress={onPress} style={styles.actionButton}>
    <Text style={styles.buttonText}>{children}</Text>
  </TouchableOpacity>
);

type ButtonSetProps = {
  padding: number;
};

const ButtonSet = ({padding}: ButtonSetProps): JSX.Element => {
  return (
    <View style={styles.buttonSet}>
      <View style={{...styles.section, ...styles.top}}>
        <Fighter facing="N" top={0} left={0} />
        <Fighter facing="E" top={0} left={20} />
        <Fighter facing="S" top={0} left={40} />
        <Fighter facing="W" top={0} left={60} />
        <EnemyFighter facing="N" top={20} left={0} />
        <EnemyFighter facing="E" top={20} left={20} />
        <EnemyFighter facing="S" top={20} left={40} />
        <EnemyFighter facing="W" top={20} left={60} />
      </View>
      <View style={{...styles.section, ...styles.middle, paddingLeft: padding}}>
        <ActionButton onPress={() => console.log('A')}>A</ActionButton>
        <ActionButton onPress={() => console.log('B')}>B</ActionButton>
      </View>
      <View style={styles.section} />
    </View>
  );
};

export default ButtonSet;
