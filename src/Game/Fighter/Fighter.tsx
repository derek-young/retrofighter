import React, {useState} from 'react';
import {StyleSheet} from 'react-native';

import Colors from 'types/colors';
import FighterIcon from 'icons/spaceship.svg';

import Craft from '../Craft';
import FighterMissile from './FighterMissile';
import {useAnimationContext} from './AnimationContext';
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
  const {facing, hasPlayerMoved, leftAnim, topAnim} = useAnimationContext();
  const {hasEliminationAnimationEnded, isPlayerEliminated, onEliminationEnd} =
    useEliminationContext();
  const [leftMissileProps, rightMissileProps] = useMissileContext();
  const [craftRotation, setCraftRotation] = useState(0);

  if (isPlayerEliminated && hasEliminationAnimationEnded) {
    return null;
  }

  const onRotationChange = ({value}: {value: number}) =>
    setCraftRotation(Math.round(value));

  const craftColor = hasPlayerMoved ? Colors.GREEN : `${Colors.GREEN}80`;

  return (
    <>
      <Craft
        Icon={FighterIcon}
        fill={craftColor}
        facing={facing}
        isEliminated={isPlayerEliminated}
        onEliminationEnd={onEliminationEnd}
        left={leftAnim}
        top={topAnim}
        rotationListener={onRotationChange}
      />
      <FighterMissile
        craftColor={craftColor}
        craftRotation={craftRotation}
        iconStyle={styles.missileLeft}
        playerLeftAnim={leftAnim}
        playerTopAnim={topAnim}
        missileProps={leftMissileProps}
      />
      <FighterMissile
        craftColor={craftColor}
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
