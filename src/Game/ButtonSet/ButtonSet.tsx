import React, {useEffect, useMemo, useRef} from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  StyleProp,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import Colors from 'types/colors';
import ClusterBombIcon from 'icons/cluster-bomb.svg';
import MissileIcon from 'icons/missile.svg';
import {maxScreenSize, missileDuration} from 'Game/constants';
import IBMText from 'components/IBMText';
import {PLAYER_ID} from 'Game/engine/Simulation';

import LifeIndicator from './LifeIndicator';

import {useGameContext} from '../GameContext';
import {useHasPlayerMoved} from '../Fighter/AnimationContext';
import {useEliminationContext} from '../Fighter/EliminationContext';
import {useMissileContext} from '../Fighter/MissileContext';
import {useItemFactoryContext} from '../items/ItemFactoryContext';

const buttonSize = Math.min(maxScreenSize / 12, 60);
const buttonIconSize = buttonSize / 2;

const styles = StyleSheet.create({
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
    borderWidth: 4,
    borderColor: `${Colors.SKY_BLUE}99`,
    margin: buttonSize / 6,
    overflow: 'hidden',
    backgroundColor: Colors.GREY,
  },
  clusterBombButton: {
    borderColor: `${Colors.PINK}99`,
  },
  buttonDisabled: {
    opacity: 0.8,
  },
  buttonBackground: {
    bottom: -4,
    left: -4,
    width: buttonSize,
    height: buttonSize,
    position: 'absolute',
    backgroundColor: Colors.RED,
  },
  missileIcon: {
    // missile.svg is drawn at 45°; straighten it upright.
    transform: [{rotate: '-45deg'}],
  },
  lives: {
    color: 'white',
    lineHeight: 24,
  },
});

type ActionButtonProps = {
  children: React.ReactNode;
  disabled: boolean;
  // Buttons without a cooldown (the one-shot cluster bomb) skip the refill
  // animation; they simply disable once their ammunition is spent.
  hasCooldown?: boolean;
  hasMissileFired: boolean;
  isEliminated: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

function animateButton(progress: Animated.Value) {
  Animated.timing(progress, {
    duration: missileDuration,
    easing: Easing.linear,
    toValue: 1,
    useNativeDriver: true,
  }).start();
}

const ActionButton = ({
  children,
  disabled,
  hasCooldown = true,
  hasMissileFired,
  isEliminated,
  onPress,
  style,
}: ActionButtonProps): JSX.Element => {
  const {isPaused} = useGameContext();
  // 0 = just fired (cooldown fill empty), 1 = ready (fill covers button).
  const progress = useRef(new Animated.Value(1)).current;

  // The fill grows from the bottom edge: scaleY around the center combined
  // with a translate that pins the bottom in place.
  const fillTransform = useMemo(
    () => [
      {
        translateY: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [buttonSize / 2, 0],
        }),
      },
      {scaleY: progress},
    ],
    [progress],
  );

  useEffect(() => {
    if (isEliminated) {
      progress.stopAnimation();
      progress.setValue(1);
    }
  }, [progress, isEliminated]);

  useEffect(() => {
    if (isPaused) {
      progress.stopAnimation();
    } else {
      animateButton(progress);
    }
  }, [progress, isPaused]);

  useEffect(() => {
    if (!hasCooldown) {
      return;
    }

    if (hasMissileFired) {
      progress.setValue(0);
      animateButton(progress);
    } else {
      progress.stopAnimation();
      progress.setValue(1);
    }
  }, [hasCooldown, hasMissileFired, progress]);

  const background = (
    <Animated.View
      style={[styles.buttonBackground, {transform: fillTransform}]}
    />
  );

  // The fill renders before the label so the label paints on top (zIndex
  // breaks native-driver transforms on iOS).
  if (disabled) {
    return (
      <View style={[styles.actionButton, style, styles.buttonDisabled]}>
        {background}
        {children}
      </View>
    );
  }

  return (
    <TouchableOpacity
      disabled={disabled}
      onPressIn={onPress}
      style={[styles.actionButton, style]}>
      {background}
      {children}
    </TouchableOpacity>
  );
};

const ButtonSet = (): JSX.Element => {
  const {remainingLives} = useGameContext();
  const hasPlayerMoved = useHasPlayerMoved();
  const {isPlayerEliminated} = useEliminationContext();
  const {effects} = useItemFactoryContext();
  const [leftMissile, rightMissile, clusterBombMissile] = useMissileContext();
  const hasClusterBomb = Boolean(effects[PLAYER_ID]?.hasClusterBomb);

  return (
    <View style={styles.section}>
      <View style={[styles.section, styles.top]}>
        {remainingLives > 0 && (
          <>
            <LifeIndicator />
            <IBMText style={styles.lives}>x {remainingLives}</IBMText>
          </>
        )}
      </View>
      <View style={[styles.section, styles.middle]}>
        <ActionButton
          disabled={
            leftMissile.hasMissileFired || isPlayerEliminated || !hasPlayerMoved
          }
          hasMissileFired={leftMissile.hasMissileFired}
          isEliminated={isPlayerEliminated}
          onPress={leftMissile.onFireMissile}>
          <MissileIcon
            fill="white"
            height={buttonIconSize}
            width={buttonIconSize}
            style={styles.missileIcon}
          />
        </ActionButton>
        <ActionButton
          disabled={
            rightMissile.hasMissileFired ||
            isPlayerEliminated ||
            !hasPlayerMoved
          }
          hasMissileFired={rightMissile.hasMissileFired}
          isEliminated={isPlayerEliminated}
          onPress={rightMissile.onFireMissile}>
          <MissileIcon
            fill="white"
            height={buttonIconSize}
            width={buttonIconSize}
            style={styles.missileIcon}
          />
        </ActionButton>
        <ActionButton
          disabled={
            !hasClusterBomb ||
            clusterBombMissile.hasMissileFired ||
            isPlayerEliminated ||
            !hasPlayerMoved
          }
          hasCooldown={false}
          hasMissileFired={clusterBombMissile.hasMissileFired}
          isEliminated={isPlayerEliminated}
          onPress={clusterBombMissile.onFireMissile}
          style={styles.clusterBombButton}>
          <ClusterBombIcon
            fill={Colors.PINK}
            height={buttonIconSize}
            width={buttonIconSize}
          />
        </ActionButton>
      </View>
      <View style={styles.section} />
    </View>
  );
};

export default ButtonSet;
