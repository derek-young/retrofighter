import React, {useState} from 'react';
import {StyleSheet} from 'react-native';

import Colors from 'types/colors';
import FighterIcon from 'icons/spaceship.svg';
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
  const [leftMissileProps, rightMissileProps] = useMissileContext();
  const [craftRotation, setCraftRotation] = useState(0);

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
      <FighterMissile
        craftRotation={craftRotation}
        iconStyle={styles.missileLeft}
        playerLeftAnim={leftAnim}
        playerTopAnim={topAnim}
        missileProps={leftMissileProps}
      />
      <FighterMissile
        craftRotation={craftRotation}
        iconStyle={styles.missileRight}
        playerLeftAnim={leftAnim}
        playerTopAnim={topAnim}
        missileProps={rightMissileProps}
      />
    </>
  );
};

export default Fighter;
