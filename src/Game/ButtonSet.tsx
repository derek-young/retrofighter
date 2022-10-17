import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Colors from 'types/colors';

import LifeIndicator from './LifeIndicator';

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

const ButtonSet = (): JSX.Element => {
  return (
    <View style={styles.buttonSet}>
      <View style={{...styles.section, ...styles.top}}>
        <LifeIndicator />
        <LifeIndicator />
        <LifeIndicator />
      </View>
      <View style={{...styles.section, ...styles.middle}}>
        <ActionButton onPress={() => console.log('A')}>A</ActionButton>
        <ActionButton onPress={() => console.log('B')}>B</ActionButton>
      </View>
      <View style={styles.section} />
    </View>
  );
};

export default ButtonSet;
