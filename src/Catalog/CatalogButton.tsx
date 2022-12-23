import React from 'react';
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import Colors from 'types/colors';
import IBMText from 'components/IBMText';
import PressStartText from 'components/PressStartText';
import silverStarImage from 'images/silver-star.png';

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
    alignItems: 'center',
    position: 'absolute',
    bottom: 6,
  },
  scoreText: {
    fontSize: 12,
  },
  star: {
    height: 10,
    width: 10,
  },
});

type CatalogButtonProps = {
  disabled: boolean;
  earned: number;
  level: number;
  onPress: () => void;
  possible: number;
};

const CatalogButton = ({
  disabled = false,
  earned,
  level,
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
        <PressStartText>{`Level ${level + 1}`}</PressStartText>
        <View style={styles.score}>
          {earned >= possible && (
            <Image source={silverStarImage} style={styles.star} />
          )}
          <IBMText style={styles.scoreText}>
            {earned}/{possible}
          </IBMText>
          {earned >= possible && (
            <Image source={silverStarImage} style={styles.star} />
          )}
        </View>
      </ButtonComponent>
    </View>
  );
};

export default CatalogButton;
