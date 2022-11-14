import React from 'react';
import {StyleSheet, TouchableOpacity, View, ViewStyle} from 'react-native';

import Colors from 'types/colors';
import IBMText from 'components/IBMText';
import PressStartText from 'components/PressStartText';

const BUTTON_WIDTH = 160;
const BUTTON_HEIGHT = 64;

const styles = StyleSheet.create({
  buttonContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 12,
  },
  button: {
    backgroundColor: Colors.GREY,
    width: BUTTON_WIDTH - 12,
    height: BUTTON_HEIGHT - 12,
    borderRadius: 4,
    paddingBottom: 8,
  },
  buttonBackground: {
    backgroundColor: `${Colors.PURPLE}90`,
    width: BUTTON_WIDTH,
    height: BUTTON_HEIGHT,
    borderRadius: 8,
  },
  score: {
    display: 'flex',
    flexDirection: 'row',
    position: 'absolute',
    bottom: 6,
  },
  star: {
    height: 12,
    width: 12,
  },
});

type CatalogButtonProps = {
  children: string;
  disabled?: boolean;
  onPress: () => void;
  possible: number;
};

const CatalogButton = ({
  children,
  disabled = false,
  onPress,
  possible,
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
        style={[styles.buttonContainer, styles.button]}>
        <PressStartText>{children}</PressStartText>
        <View style={styles.score}>
          <IBMText style={{fontSize: 12}}>0/{possible}</IBMText>
        </View>
      </ButtonComponent>
    </View>
  );
};

export default CatalogButton;
