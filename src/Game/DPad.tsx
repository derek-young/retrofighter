import React, {useState} from 'react';
import {StyleSheet, TouchableOpacity, View, ViewStyle} from 'react-native';

import Colors from 'types/colors';

import {useFighterContext} from './Fighter/FigherContext';
import {leftRightPadding} from './gameConstants';

const styles = StyleSheet.create({
  dPad: {
    flexBasis: '25%',
    justifyContent: 'center',
  },
  container: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  directional: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: Colors.GREY,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  arrow: {
    height: 0,
    width: 0,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'transparent',
    borderBottomColor: Colors.PURPLE,
    position: 'absolute',
    top: 0,
  },
});

type ArrowProps = {
  buttonWidth: number;
};

const Arrow = ({buttonWidth}: ArrowProps): JSX.Element => {
  const arrowStyles = {
    ...styles.arrow,
    borderWidth: buttonWidth / 4,
  } as ViewStyle;

  return <View style={arrowStyles} />;
};

type EmptyProps = {
  buttonWidth: number;
};

const Empty = ({buttonWidth}: EmptyProps): JSX.Element => (
  <View style={{width: buttonWidth, height: buttonWidth}} />
);

type ButtonRotation = 0 | 90 | 180 | 270;

type DirectionalProps = {
  buttonWidth: number;
  onPress: () => void;
  rotation: ButtonRotation;
};

const Directional = ({
  buttonWidth,
  onPress,
  rotation,
}: DirectionalProps): JSX.Element => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      ...styles.directional,
      width: buttonWidth,
      height: buttonWidth,
      transform: [{rotate: `${rotation}deg`}],
    }}>
    <Arrow buttonWidth={buttonWidth} />
  </TouchableOpacity>
);

const DPad = (): JSX.Element => {
  const {onDownPress, onUpPress, onLeftPress, onRightPress} =
    useFighterContext();
  const [buttonWidth, setButtonWidth] = useState(0);

  return (
    <View
      onLayout={e => {
        const {width} = e.nativeEvent.layout;
        setButtonWidth((width - leftRightPadding) / 3);
      }}
      style={{...styles.dPad, paddingRight: leftRightPadding}}>
      <View style={styles.container}>
        <Empty buttonWidth={buttonWidth} />
        <Directional
          buttonWidth={buttonWidth}
          onPress={onUpPress}
          rotation={0}
        />
        <Empty buttonWidth={buttonWidth} />
        <Directional
          buttonWidth={buttonWidth}
          onPress={onLeftPress}
          rotation={270}
        />
        <Empty buttonWidth={buttonWidth} />
        <Directional
          buttonWidth={buttonWidth}
          onPress={onRightPress}
          rotation={90}
        />
        <Empty buttonWidth={buttonWidth} />
        <Directional
          buttonWidth={buttonWidth}
          onPress={onDownPress}
          rotation={180}
        />
      </View>
    </View>
  );
};

export default DPad;
