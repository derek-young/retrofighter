import React, {useRef, useState} from 'react';
import {StyleSheet} from 'react-native';

import Colors from 'types/colors';
import FighterIcon from 'icons/spaceship.svg';
import {MissileAnimation} from 'Game/Missile';
import {useEliminationContext} from 'Game/Fighter/EliminationContext';

import Craft from '../Craft';
import FighterMissile from './FighterMissile';
import {useAnimationContext} from './AnimationContext';
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
  const {facing, leftAnim, topAnim} = useAnimationContext();
  const {hasEliminationAnimationEnded, isEliminated, onEliminationEnd} =
    useEliminationContext();
  const {hasLeftMissileFired, hasRightMissileFired} = useMissileContext();
  const [craftRotation, setCraftRotation] = useState(0);
  const hasLeftMissileFiredRef = useRef(hasLeftMissileFired);
  const hasRightMissileFiredRef = useRef(hasRightMissileFired);

  hasLeftMissileFiredRef.current = hasLeftMissileFired;
  hasRightMissileFiredRef.current = hasLeftMissileFired;

  if (isEliminated && hasEliminationAnimationEnded) {
    return null;
  }

  const onRotationChange = ({value}: {value: number}) =>
    setCraftRotation(Math.round(value));

  return (
    <>
      <Craft
        Icon={FighterIcon}
        fill={Colors.GREEN}
        facing={facing}
        isEliminated={isEliminated}
        onEliminationEnd={onEliminationEnd}
        left={leftAnim}
        top={topAnim}
        rotationListener={onRotationChange}
      />
      <MissileAnimation
        craftRotation={craftRotation}
        isDetachedFromParent={hasLeftMissileFired}
        leftAnim={leftAnim}
        topAnim={topAnim}>
        <FighterMissile
          className={styles.missileLeft}
          hasMissileFired={hasLeftMissileFired}
          hasMissileImpacted={false}
        />
      </MissileAnimation>
      <MissileAnimation
        craftRotation={craftRotation}
        isDetachedFromParent={hasRightMissileFired}
        leftAnim={leftAnim}
        topAnim={topAnim}>
        <FighterMissile
          className={styles.missileRight}
          hasMissileFired={hasRightMissileFired}
          hasMissileImpacted={false}
        />
      </MissileAnimation>
    </>
  );
};

export default Fighter;
