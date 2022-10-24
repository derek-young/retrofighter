import React, {useEffect, useState} from 'react';
import {SvgProps} from 'react-native-svg';

import Colors from 'types/colors';
import Craft, {CraftProps} from 'Game/Craft';
import {useAnimationContext} from 'Game/Fighter/AnimationContext';

import useCollisionDetector from './useCollisionDetector';
import useEnemyCraftAnimation from './useEnemyCraftAnimation';

export interface EnemyCraftProps {
  defaultFacing?: CraftProps['facing'];
  Icon: React.FC<SvgProps>;
  startingTop?: number;
  startingLeft?: number;
}

const EnemyCraft = ({
  defaultFacing = 'S',
  Icon,
  startingTop = 0,
  startingLeft = 0,
}: EnemyCraftProps): null | JSX.Element => {
  const {hasPlayerMoved} = useAnimationContext();
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isEliminated, setIsEliminated] = useState(false);
  const [hasEliminationAnimationEnded, setHasEliminationAnimationEnded] =
    useState(false);

  const {facing, initialize, leftAnim, topAnim} = useEnemyCraftAnimation({
    defaultFacing,
    hasEliminationAnimationEnded,
    startingLeft,
    startingTop,
  });

  useCollisionDetector({
    hasPlayerMoved,
    isEliminated,
    leftAnim,
    topAnim,
    startingLeft,
    startingTop,
    setIsEliminated,
  });

  useEffect(() => {
    if (hasPlayerMoved && !hasInitialized) {
      initialize();
      setHasInitialized(false);
    }
  }, [hasInitialized, hasPlayerMoved, initialize]);

  if (hasEliminationAnimationEnded) {
    return null;
  }

  return (
    <Craft
      Icon={Icon}
      isEliminated={isEliminated}
      facing={facing}
      fill={Colors.RED}
      left={leftAnim}
      top={topAnim}
      onEliminationEnd={() => setHasEliminationAnimationEnded(true)}
    />
  );
};

export default EnemyCraft;
