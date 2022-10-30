import React, {useRef} from 'react';
import {StyleSheet, View} from 'react-native';

import Colors from 'types/colors';
import ChevronRight from 'icons/right-chevron.svg';
import ChevronRightNarrow from 'icons/right-chevron-narrow.svg';

import {useAnimationContext} from './Fighter/AnimationContext';

const buttonSize = 40;

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
    justifyContent: 'center',
    width: buttonSize,
    height: buttonSize,
    shadowColor: 'black',
    shadowOffset: {width: -2, height: 0},
    shadowOpacity: 0.4,
  },
  largeChevron: {
    position: 'absolute',
    height: buttonSize,
    width: buttonSize,
    left: 16,
  },
  mediumChevron: {
    position: 'absolute',
    height: 24,
    width: 24,
  },
  smallChevron: {
    position: 'absolute',
    height: 16,
    width: 16,
    right: 24,
  },
});

const Empty = (): null | JSX.Element => <View style={styles.directional} />;

type ButtonRotation = 0 | 90 | 180 | 270;

type DirectionalProps = {
  rotation: ButtonRotation;
};

const Directional = ({rotation}: DirectionalProps): JSX.Element => (
  <View
    style={{
      ...styles.directional,
      transform: [{rotate: `${rotation}deg`}],
    }}>
    <View style={styles.largeChevron}>
      <ChevronRight fill={Colors.GREY} />
    </View>
    <View style={styles.mediumChevron}>
      <ChevronRightNarrow fill={Colors.GREY} />
    </View>
    <View style={styles.smallChevron}>
      <ChevronRightNarrow fill={Colors.GREY} />
    </View>
  </View>
);

const DPad = (): JSX.Element => {
  const xRef = useRef(0);
  const yRef = useRef(0);
  const {onDownPress, onUpPress, onLeftPress, onRightPress} =
    useAnimationContext();

  return (
    <View
      onTouchStart={e => {
        xRef.current = e.nativeEvent.pageX;
        yRef.current = e.nativeEvent.pageY;
      }}
      onTouchEnd={e => {
        const xDiff = e.nativeEvent.pageX - xRef.current;
        const yDiff = e.nativeEvent.pageY - yRef.current;

        if (Math.abs(xDiff) > Math.abs(yDiff)) {
          if (xDiff > 0) {
            onRightPress();
          }
          if (xDiff < 0) {
            onLeftPress();
          }
        } else {
          if (yDiff > 0) {
            onDownPress();
          }
          if (yDiff < 0) {
            onUpPress();
          }
        }
      }}
      style={styles.dPad}>
      <View style={styles.container}>
        <Empty />
        <Empty />
        <Directional rotation={270} />
        <Empty />
        <Empty />
        <Empty />
        <Directional rotation={180} />
        <Empty />
        <Directional rotation={0} />
        <Empty />
        <Empty />
        <Empty />
        <Directional rotation={90} />
      </View>
    </View>
  );
};

export default DPad;
