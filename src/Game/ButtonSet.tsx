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
import {missileDuration} from 'Game/constants';

import LifeIndicator from './LifeIndicator';
import {useGameContext} from './GameContext';
import {useAnimationContext} from './Fighter/AnimationContext';
import {useEliminationContext} from './Fighter/EliminationContext';
import {useMissileContext} from './Fighter/MissileContext';

const buttonSize = 56;

const styles = StyleSheet.create({
  buttonSet: {
    flex: 1,
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
    height: buttonSize,
    width: buttonSize,
    borderRadius: buttonSize / 2,
    margin: 12,
    shadowColor: 'black',
    shadowOffset: {width: 2, height: 2},
    shadowOpacity: 0.4,
    overflow: 'hidden',
    backgroundColor: Colors.GREY,
  },
  buttonDisabled: {
    opacity: 0.8,
  },
  buttonBackground: {
    bottom: 0,
    left: 0,
    width: buttonSize,
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
  hasMissileFired: boolean;
  isEliminated: boolean;
  onPress: () => void;
};

function animateButton(anim: Animated.Value) {
  Animated.timing(anim, {
    duration: missileDuration,
    easing: Easing.linear,
    toValue: buttonSize,
    useNativeDriver: false,
  }).start();
}

const ActionButton = ({
  children,
  disabled,
  hasMissileFired,
  isEliminated,
  onPress,
}: ActionButtonProps): JSX.Element => {
  const {isPaused} = useGameContext();
  const heightAnim = useRef(new Animated.Value(buttonSize)).current;

  useEffect(() => {
    if (isEliminated) {
      heightAnim.stopAnimation();
      heightAnim.setValue(buttonSize);
    }
  }, [heightAnim, isEliminated]);

  useEffect(() => {
    if (isPaused) {
      heightAnim.stopAnimation();
    } else {
      animateButton(heightAnim);
    }
  }, [heightAnim, isPaused]);

  useEffect(() => {
    if (hasMissileFired) {
      heightAnim.setValue(0);
      animateButton(heightAnim);
    } else {
      heightAnim.stopAnimation();
      heightAnim.setValue(buttonSize);
    }
  }, [hasMissileFired, heightAnim]);

  if (disabled) {
    return (
      <View style={[styles.actionButton, styles.buttonDisabled]}>
        <Text style={styles.buttonText}>{children}</Text>
        <Animated.View
          style={{...styles.buttonBackground, height: heightAnim}}
        />
      </View>
    );
  }

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
  const {isPlayerEliminated, remainingLives} = useEliminationContext();
  const [leftMissile, rightMissile] = useMissileContext();

  return (
    <View style={styles.buttonSet}>
      <View style={[styles.section, styles.top]}>
        {new Array(remainingLives).fill(0).map((_, i) => (
          <LifeIndicator key={i} />
        ))}
      </View>
      <View style={[styles.section, styles.middle]}>
        <ActionButton
          disabled={leftMissile.hasMissileFired || isPlayerEliminated}
          hasMissileFired={leftMissile.hasMissileFired}
          isEliminated={isPlayerEliminated}
          onPress={() => {
            if (!hasPlayerMoved) {
              setHasPlayerMoved(true);
            }
            leftMissile.onFireMissile();
          }}>
          A
        </ActionButton>
        <ActionButton
          disabled={rightMissile.hasMissileFired || isPlayerEliminated}
          hasMissileFired={rightMissile.hasMissileFired}
          isEliminated={isPlayerEliminated}
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
