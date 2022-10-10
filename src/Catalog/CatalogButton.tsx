import React from 'react';
import {StyleSheet, TouchableOpacity, View, ViewStyle} from 'react-native';

import PressStartText from 'components/PressStartText';

const BUTTON_WIDTH = 160;
const BUTTON_HEIGHT = 56;

const styles = StyleSheet.create({
  buttonContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 8,
  },
  button: {
    backgroundColor: '#D9D9D9',
    width: BUTTON_WIDTH - 12,
    height: BUTTON_HEIGHT - 12,
    borderRadius: 4,
  },
  buttonBackground: {
    backgroundColor: '#00000030',
    width: BUTTON_WIDTH,
    height: BUTTON_HEIGHT,
    borderRadius: 8,
  },
});

type CatalogButtonProps = {
  children: string;
  disabled?: boolean;
  onPress: () => void;
};

const CatalogButton = ({
  children,
  disabled = false,
  onPress,
}: CatalogButtonProps): JSX.Element => {
  const containerStyles = {
    ...styles.buttonContainer,
    ...styles.buttonBackground,
  } as ViewStyle;

  const ButtonComponent = (
    disabled ? View : TouchableOpacity
  ) as React.ElementType;

  if (disabled) {
    containerStyles.opacity = 0.7;
  }

  return (
    <View style={containerStyles}>
      <ButtonComponent
        onPress={onPress}
        style={{...styles.buttonContainer, ...styles.button}}>
        <PressStartText>{children}</PressStartText>
      </ButtonComponent>
    </View>
  );
};

export default CatalogButton;
