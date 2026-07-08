import React, {useEffect, useRef, useState} from 'react';
import {Animated, StyleSheet} from 'react-native';

import Colors from 'types/colors';
import FighterIcon from 'icons/spaceship.svg';
import {PLAYER_ID} from 'Game/engine/Simulation';

import Craft, {DEFAULT_FACING_ROTATION} from '../Craft';
import {defaultPlayerFacing} from '../constants';
import FighterMissile from './FighterMissile';
import {
  useAnimationContext,
  useHasPlayerMoved,
  usePlayerFacing,
} from './AnimationContext';
import {useEliminationContext} from './EliminationContext';
import {useMissileContext} from './MissileContext';

const styles = StyleSheet.create({
  missileLeft: {
    left: -3,
  },
  missileRight: {
    left: 11,
  },
});

const Fighter = (): null | JSX.Element => {
  const {leftAnim, topAnim} = useAnimationContext();
  const facing = usePlayerFacing();
  const hasPlayerMoved = useHasPlayerMoved();
  const {hasEliminationAnimationEnded, isPlayerEliminated, onEliminationEnd} =
    useEliminationContext();
  const [leftMissileProps, rightMissileProps] = useMissileContext();
  const rotationAnim = useRef(
    new Animated.Value(DEFAULT_FACING_ROTATION[defaultPlayerFacing]),
  ).current;
  const [isAwaitingMissileAnimEnd, setIsAwaitingMissileAnimEnd] =
    useState(false);

  const hasFiredMissile =
    leftMissileProps.hasMissileFired || rightMissileProps.hasMissileFired;

  useEffect(() => {
    if (isAwaitingMissileAnimEnd && !hasFiredMissile) {
      onEliminationEnd();
    }
  }, [hasFiredMissile, isAwaitingMissileAnimEnd, onEliminationEnd]);

  if (hasEliminationAnimationEnded) {
    return null;
  }

  const craftColor = hasPlayerMoved ? Colors.GREEN : `${Colors.GREEN}80`;

  // Missiles are mounted before the craft so the craft paints on top of
  // them (they used to rely on zIndex, which breaks native-driver
  // transforms on iOS).
  return (
    <>
      {(!isPlayerEliminated || leftMissileProps.hasMissileFired) && (
        <FighterMissile
          craftColor={craftColor}
          craftRotationAnim={rotationAnim}
          facing={facing}
          iconStyle={styles.missileLeft}
          leftAnim={leftAnim}
          topAnim={topAnim}
          missileId="player-missile-left"
          missileProps={leftMissileProps}
          positionOffset={6.9}
        />
      )}
      {(!isPlayerEliminated || rightMissileProps.hasMissileFired) && (
        <FighterMissile
          craftColor={craftColor}
          craftRotationAnim={rotationAnim}
          facing={facing}
          iconStyle={styles.missileRight}
          leftAnim={leftAnim}
          topAnim={topAnim}
          missileId="player-missile-right"
          missileProps={rightMissileProps}
          positionOffset={18}
        />
      )}
      <Craft
        Icon={FighterIcon}
        fill={craftColor}
        facing={facing}
        isEliminated={isPlayerEliminated}
        onEliminationEnd={() => {
          if (hasFiredMissile) {
            setIsAwaitingMissileAnimEnd(true);
          } else {
            onEliminationEnd();
          }
        }}
        left={leftAnim}
        top={topAnim}
        rotationAnim={rotationAnim}
        simId={PLAYER_ID}
        score={-500}
      />
    </>
  );
};

export default Fighter;
