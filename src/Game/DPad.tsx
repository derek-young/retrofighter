import React, {useRef} from 'react';
import {StyleSheet, View} from 'react-native';

import Colors from 'types/colors';
import ChevronRight from 'icons/right-chevron.svg';
import ChevronRightNarrow from 'icons/right-chevron-narrow.svg';

import {useAnimationContext} from './Fighter/AnimationContext';

const buttonSize = 40;

const styles = StyleSheet.create({
  dPad: {
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{rotate: '45deg'}],
  },
  swipeableArea: {
    position: 'absolute',
    backgroundColor: '#00000040',
    width: buttonSize * 4,
    height: buttonSize * 4,
    borderRadius: buttonSize * 2,
  },
  directional: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: buttonSize * 3,
    height: buttonSize * 3,
    shadowColor: 'black',
    shadowOffset: {width: -2, height: 0},
    shadowOpacity: 0.4,
  },
  largeChevron: {
    position: 'absolute',
    height: buttonSize,
    width: buttonSize,
    left: 8,
  },
  mediumChevron: {
    position: 'absolute',
    height: 24,
    width: 24,
    left: 2,
  },
  smallChevron: {
    position: 'absolute',
    height: 16,
    width: 16,
    left: -4,
  },
});

type ButtonRotation = 45 | 135 | 225 | 315;

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
  const {
    hasPlayerMoved,
    setHasPlayerMoved,
    onDownPress,
    onUpPress,
    onLeftPress,
    onRightPress,
  } = useAnimationContext();

  return (
    <View
      onTouchStart={e => {
        if (!hasPlayerMoved) {
          setHasPlayerMoved(true);
        }

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
        <View style={styles.swipeableArea} />
        <View>
          <Directional rotation={225} />
          <Directional rotation={135} />
        </View>
        <View>
          <Directional rotation={315} />
          <Directional rotation={45} />
        </View>
      </View>
    </View>
  );
};

export default DPad;
