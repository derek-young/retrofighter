import React, {useRef, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

import Colors from 'types/colors';
import ChevronRight from 'icons/right-chevron.svg';
import ChevronRightNarrow from 'icons/right-chevron-narrow.svg';

import IBMText from 'components/IBMText';
import {useGameContext} from 'Game/GameContext';
import {maxScreenSize} from 'Game/constants';

import {useAnimationContext} from '../Fighter/AnimationContext';
import {Facing} from '../types';

const buttonSize = Math.min(maxScreenSize / 20, 40);

const styles = StyleSheet.create({
  dPad: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{rotate: '45deg'}],
    width: '100%',
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
  helperTextContainer: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 4,
    borderRadius: 4,
  },
  helperText: {
    color: 'white',
    fontSize: 12,
  },
});

type ButtonRotation = 45 | 135 | 225 | 315;

type DirectionalProps = {
  facing: Facing;
  rotation: ButtonRotation;
};

const Directional = ({facing, rotation}: DirectionalProps): JSX.Element => {
  const {setThrusterEngagedFacing} = useAnimationContext();
  const [isPressed, setIsPressed] = useState(false);

  return (
    <Pressable
      delayLongPress={250}
      onLongPress={() => {
        setIsPressed(true);
        setThrusterEngagedFacing(facing);
      }}
      onPressOut={() => {
        setIsPressed(false);
        setThrusterEngagedFacing(null);
      }}
      style={[
        styles.directional,
        // eslint-disable-next-line react-native/no-inline-styles
        {
          opacity: isPressed ? 0.4 : 1,
          transform: [{rotate: `${rotation}deg`}],
        },
      ]}>
      <View style={styles.largeChevron}>
        <ChevronRight fill={Colors.GREY} />
      </View>
      <View style={styles.mediumChevron}>
        <ChevronRightNarrow fill={Colors.GREY} />
      </View>
      <View style={styles.smallChevron}>
        <ChevronRightNarrow fill={Colors.GREY} />
      </View>
    </Pressable>
  );
};

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
  const {epic} = useGameContext();

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

        if (Math.abs(xDiff) > 24 || Math.abs(yDiff) > 24) {
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
        }
      }}
      style={styles.dPad}>
      {epic === 0 ? (
        <View style={styles.helperTextContainer}>
          <IBMText style={styles.helperText}>Swipe pad to turn.</IBMText>
          <IBMText style={styles.helperText}>Press and hold to</IBMText>
          <IBMText style={styles.helperText}>engage boosters.</IBMText>
        </View>
      ) : null}
      <View style={styles.container}>
        <View style={styles.swipeableArea} />
        <View>
          <Directional facing="N" rotation={225} />
          <Directional facing="W" rotation={135} />
        </View>
        <View>
          <Directional facing="E" rotation={315} />
          <Directional facing="S" rotation={45} />
        </View>
      </View>
    </View>
  );
};

export default DPad;
