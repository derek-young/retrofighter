import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Colors from 'types/colors';
import {missileDuration} from 'Game/gameConstants';

import LifeIndicator from './LifeIndicator';
import {useAnimationContext} from './Fighter/AnimationContext';
import {useEliminationContext} from './Fighter/EliminationContext';
import {useMissileContext} from './Fighter/MissileContext';

const styles = StyleSheet.create({
  buttonSet: {
    flexBasis: '25%',
  },
  section: {
    flex: 1,
  },
  top: {
    display: 'flex',
    flexDirection: 'row',
  },
  middle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    width: 48,
    borderRadius: 24,
    margin: 12,
    shadowColor: 'black',
    shadowOffset: {width: 2, height: 2},
    shadowOpacity: 0.4,
    overflow: 'hidden',
    backgroundColor: Colors.GREY,
  },
  buttonBackground: {
    bottom: 0,
    left: 0,
    width: 48,
    position: 'absolute',
    zIndex: -1,
    backgroundColor: Colors.RED,
  },
  buttonText: {
    color: 'white',
    fontSize: 24,
  },
});

type ActionButtonProps = {
  children: string;
  disabled: boolean;
  onPress: () => void;
  onRecharge: () => void;
};

const ActionButton = ({
  children,
  disabled,
  onPress,
  onRecharge,
}: ActionButtonProps): JSX.Element => {
  const heightAnim = useRef(new Animated.Value(48)).current;

  useEffect(() => {
    if (disabled) {
      heightAnim.setValue(0);

      Animated.timing(heightAnim, {
        duration: missileDuration,
        easing: Easing.linear,
        toValue: 48,
        useNativeDriver: false,
      }).start(onRecharge);
    }
  }, [disabled, heightAnim, onRecharge]);

  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      style={styles.actionButton}>
      <Text style={styles.buttonText}>{children}</Text>
      <Animated.View style={{...styles.buttonBackground, height: heightAnim}} />
    </TouchableOpacity>
  );
};

const ButtonSet = (): JSX.Element => {
  const {hasPlayerMoved, setHasPlayerMoved} = useAnimationContext();
  const {remainingLives} = useEliminationContext();
  const [leftMissile, rightMissile] = useMissileContext();

  return (
    <View style={styles.buttonSet}>
      <View style={{...styles.section, ...styles.top}}>
        {new Array(remainingLives).fill(0).map((_, i) => (
          <LifeIndicator key={i} />
        ))}
      </View>
      <View style={{...styles.section, ...styles.middle}}>
        <ActionButton
          disabled={leftMissile.hasMissileFired}
          onRecharge={leftMissile.resetMissileState}
          onPress={() => {
            if (!hasPlayerMoved) {
              setHasPlayerMoved(true);
            }
            leftMissile.onFireMissile();
          }}>
          A
        </ActionButton>
        <ActionButton
          disabled={rightMissile.hasMissileFired}
          onRecharge={rightMissile.resetMissileState}
          onPress={() => {
            if (!hasPlayerMoved) {
              setHasPlayerMoved(true);
            }
            rightMissile.onFireMissile();
          }}>
          B
        </ActionButton>
      </View>
      <View style={styles.section} />
    </View>
  );
};

export default ButtonSet;
