import React from 'react';
import {Pressable, StyleProp, StyleSheet, ViewStyle} from 'react-native';

import Colors from 'types/colors';

import IBMText from './IBMText';

const styles = StyleSheet.create({
  button: {
    borderRadius: 4,
    padding: 8,
    shadowColor: 'black',
    shadowOffset: {width: 2, height: 2},
    shadowOpacity: 0.4,
    borderWidth: 2,
  },
  primary: {
    backgroundColor: Colors.SKY_BLUE,
    borderColor: Colors.SKY_BLUE,
  },
  secondary: {
    backgroundColor: 'white',
    borderColor: Colors.SKY_BLUE,
  },
  text: {
    color: Colors.MIDNIGHT_BLUE,
  },
});

interface ButtonProps {
  children: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  variant?: 'primary' | 'secondary';
}

const Button = ({
  children,
  onPress,
  style = {},
  variant = 'primary',
}: ButtonProps) => (
  <Pressable
    style={[
      styles.button,
      variant === 'primary' ? styles.primary : styles.secondary,
      style,
    ]}
    onPress={onPress}>
    <IBMText style={styles.text}>{children}</IBMText>
  </Pressable>
);

export default Button;
