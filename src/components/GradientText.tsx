import React from 'react';
import {Text, TextProps} from 'react-native';
import LinearGradient, {
  LinearGradientProps,
} from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';

interface GradientTextProps {
  textProps: TextProps;
  gradientProps: LinearGradientProps;
}

const GradientText = ({
  gradientProps,
  textProps,
}: GradientTextProps): JSX.Element => (
  <MaskedView maskElement={<Text {...textProps} />}>
    <LinearGradient {...gradientProps}>
      <Text {...textProps} style={[textProps.style, {opacity: 0}]} />
    </LinearGradient>
  </MaskedView>
);

export default GradientText;
