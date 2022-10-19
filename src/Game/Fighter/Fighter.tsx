import React, {useEffect} from 'react';

import Colors from 'types/colors';
import FighterIcon from 'icons/spaceship.svg';
import {useEliminationContext} from 'Game/Fighter/EliminationContext';

import Craft from '../Craft';
import {useAnimationContext} from './AnimationContext';

const Fighter = (): null | JSX.Element => {
  const {facing, leftAnim, topAnim, resetAnimationContext} =
    useAnimationContext();
  const {
    hasEliminationAnimationEnded,
    isEliminated,
    onEliminationEnd,
    resetEliminationContext,
  } = useEliminationContext();

  useEffect(() => {
    if (isEliminated && hasEliminationAnimationEnded) {
      setTimeout(() => {
        resetAnimationContext();
        resetEliminationContext();
      }, 3000);
    }
  }, [
    isEliminated,
    hasEliminationAnimationEnded,
    resetAnimationContext,
    resetEliminationContext,
  ]);

  if (isEliminated && hasEliminationAnimationEnded) {
    return null;
  }

  return (
    <Craft
      Icon={FighterIcon}
      fill={Colors.GREEN}
      facing={facing}
      isEliminated={isEliminated}
      onEliminationEnd={onEliminationEnd}
      left={leftAnim}
      top={topAnim}
    />
  );
};

export default Fighter;
