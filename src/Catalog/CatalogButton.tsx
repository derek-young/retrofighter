import React from 'react';
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import Colors from 'types/colors';
import PressStartText from 'components/PressStartText';
import silverStarImage from 'images/silver-star.png';

const BUTTON_WIDTH = 160;
const BUTTON_HEIGHT = 56;

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
    paddingBottom: 4,
  },
  buttonBackground: {
    backgroundColor: `${Colors.PURPLE}90`,
    width: BUTTON_WIDTH,
    height: BUTTON_HEIGHT,
    borderRadius: 8,
  },
  stars: {
    display: 'flex',
    flexDirection: 'row',
    position: 'absolute',
    bottom: 4,
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
  stars: number;
};

const CatalogButton = ({
  children,
  disabled = false,
  onPress,
  stars,
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
        <View style={styles.stars}>
          {new Array(stars).fill(0).map((_, i) => (
            <Image key={i} source={silverStarImage} style={styles.star} />
          ))}
        </View>
      </ButtonComponent>
    </View>
  );
};

export default CatalogButton;
