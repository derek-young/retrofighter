import React from 'react';
import {Pressable, StyleProp, StyleSheet, ViewStyle} from 'react-native';

import Colors from 'types/colors';

import IBMText from './IBMText';

const styles = StyleSheet.create({
  button: {
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: 'black',
    shadowOffset: {width: 2, height: 2},
    shadowOpacity: 0.4,
    borderWidth: 2,
  },
  primary: {
    backgroundColor: Colors.DAVY_GREY,
    borderColor: Colors.DAVY_GREY,
  },
  secondary: {
    backgroundColor: 'white',
    borderColor: Colors.DAVY_GREY,
  },
  primaryText: {
    color: 'white',
    fontWeight: '600',
  },
  secondaryText: {
    color: Colors.DAVY_GREY,
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
    <IBMText
      style={variant === 'primary' ? styles.primaryText : styles.secondaryText}>
      {children}
    </IBMText>
  </Pressable>
);

export default Button;
