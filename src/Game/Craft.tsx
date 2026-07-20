import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Animated, StyleSheet} from 'react-native';

import Colors from 'types/colors';
import ExposionIcon from 'icons/supernova.svg';
import PressStartText from 'components/PressStartText';

import {alleyWidth, craftSize} from './constants';
import {Facing} from './types';
import {useGameContext} from './GameContext';
import {useSimulationContext} from './engine/SimulationContext';

const explosionSize = 50;
const scoreFontSize = 16;

const styles = StyleSheet.create({
  iconContainer: {
    height: craftSize,
    width: craftSize,
    position: 'absolute',
    top: 0,
    left: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadow: {
    position: 'absolute',
    zIndex: -1,
  },
  elimination: {
    position: 'absolute',
  },
  scoreContainer: {
    position: 'absolute',
  },
  score: {
    fontSize: scoreFontSize,
    width: scoreFontSize * 4,
    shadowColor: 'black',
    shadowOpacity: 0.4,
    shadowOffset: {width: scoreFontSize / 8, height: scoreFontSize / 8},
  },
});

export const DEFAULT_FACING_ROTATION: Record<Facing, number> = {
  ['N']: 0,
  ['E']: 90,
  ['S']: 180,
  ['W']: -90,
};

const sFacingRotation = {
  ...DEFAULT_FACING_ROTATION,
  ['W']: 270,
};

const wFacingRotation = {
  ...DEFAULT_FACING_ROTATION,
  ['S']: -180,
};

function getNextRotationSet(facing: Facing) {
  switch (facing) {
    case 'N':
      return DEFAULT_FACING_ROTATION;
    case 'E':
      return DEFAULT_FACING_ROTATION;
    case 'S':
      return sFacingRotation;
    case 'W':
      return wFacingRotation;
    default:
      return DEFAULT_FACING_ROTATION;
  }
}

const SHADOW_POS = {
  ['N']: {top: 3, left: 2},
  ['E']: {top: -3, left: 2},
  ['S']: {top: -3, left: -2},
  ['W']: {top: 3, left: -2},
};

const scorePosition: Record<Facing, Record<string, number>> = {
  ['N']: {top: 28},
  ['E']: {right: 4},
  ['S']: {top: 28},
  ['W']: {left: 4},
};

function getScorePosition(facing: Facing, top: number) {
  if (facing === 'E' && top < alleyWidth) {
    return {left: 4};
  }

  if (facing === 'W' && top < alleyWidth) {
    return {right: 4};
  }

  return scorePosition[facing];
}

const rotationRange = {
  inputRange: [-360, 360],
  outputRange: ['-360deg', '360deg'],
};

export type CraftProps = {
  Icon: React.ElementType;
  isEliminated: boolean;
  facing: Facing;
  fill: string;
  insignia?: React.ReactNode;
  onEliminationEnd: () => void;
  top: number | Animated.Value;
  left: number | Animated.Value;
  rotationAnim?: Animated.Value;
  onRotationEnd?: (rotation: number) => void;
  simId?: string;
  score: number;
};

const Craft = ({
  Icon,
  isEliminated,
  facing,
  fill,
  insignia,
  onEliminationEnd,
  left,
  top,
  rotationAnim,
  onRotationEnd,
  simId,
  score,
}: CraftProps): JSX.Element => {
  const {adjustScore} = useGameContext();
  const simulation = useSimulationContext();
  const shadow = SHADOW_POS[facing];
  const fallbackRotationAnim = useRef(
    new Animated.Value(DEFAULT_FACING_ROTATION[facing]),
  ).current;
  const rotation = rotationAnim ?? fallbackRotationAnim;
  const elimAnim = useRef(new Animated.Value(0)).current;
  const facingRef = useRef(facing);
  const onEliminationEndRef = useRef(onEliminationEnd);
  const onRotationEndRef = useRef(onRotationEnd);
  const [hasEliminationEnded, setHasEliminationEnded] = useState(false);
  const [scorePlacement, setScorePlacement] = useState<Record<
    string,
    number
  > | null>(null);

  onRotationEndRef.current = onRotationEnd;
  onEliminationEndRef.current = onEliminationEnd;

  const {rotate, counterRotate, explosionScale, scoreScale} = useMemo(
    () => ({
      rotate: rotation.interpolate(rotationRange),
      counterRotate: Animated.multiply(rotation, -1).interpolate(rotationRange),
      explosionScale: elimAnim,
      scoreScale: elimAnim.interpolate({
        inputRange: [0, 0.32, 1],
        outputRange: [0, 1, 1],
      }),
    }),
    [elimAnim, rotation],
  );

  useEffect(() => {
    if (isEliminated) {
      adjustScore(score);

      const craftTop = simId
        ? simulation.getPosition(simId)?.top
        : typeof top === 'number'
        ? top
        : undefined;

      setScorePlacement(getScorePosition(facingRef.current, craftTop ?? 0));

      Animated.timing(elimAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start(() => {
        onEliminationEndRef.current();
        elimAnim.setValue(0);
        setHasEliminationEnded(true);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adjustScore, elimAnim, isEliminated, score, simId, simulation]);

  useEffect(() => {
    const nextRotation = getNextRotationSet(facingRef.current)[facing];

    facingRef.current = facing;

    Animated.timing(rotation, {
      toValue: nextRotation,
      duration: 150,
      useNativeDriver: true,
    }).start(({finished}) => {
      if (!finished) {
        return;
      }

      // Normalize values on animation finish so the value stays within the
      // interpolation range across repeated turns.
      let settledRotation = nextRotation;

      if (nextRotation === -180) {
        rotation.setValue(180);
        settledRotation = 180;
      }
      if (nextRotation === 270) {
        rotation.setValue(-90);
        settledRotation = -90;
      }

      onRotationEndRef.current?.(settledRotation);
    });
  }, [facing, rotation]);

  return (
    <Animated.View
      style={[
        styles.iconContainer,
        {
          transform: [{translateX: left}, {translateY: top}, {rotate}],
        },
      ]}>
      {hasEliminationEnded ? null : (
        <>
          <Icon fill={fill} />
          <Icon
            fill="#00000040"
            width={craftSize}
            height={craftSize}
            style={{...styles.shadow, ...shadow}}
          />
          {insignia}
        </>
      )}
      <Animated.View
        style={[styles.elimination, {transform: [{scale: explosionScale}]}]}>
        <ExposionIcon height={explosionSize} width={explosionSize} />
      </Animated.View>
      {isEliminated && !hasEliminationEnded && scorePlacement !== null && (
        <Animated.View
          style={[
            styles.scoreContainer,
            scorePlacement,
            {transform: [{rotate: counterRotate}, {scale: scoreScale}]},
          ]}>
          <PressStartText
            style={[
              styles.score,
              {color: score > 0 ? Colors.GREEN : Colors.RED},
            ]}>
            {score > 0 ? `+${score}` : score}
          </PressStartText>
        </Animated.View>
      )}
    </Animated.View>
  );
};

export default Craft;
