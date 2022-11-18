import React, {useEffect, useState} from 'react';

import Colors from 'types/colors';
import Craft from 'Game/Craft';

import {useEnemyCraftContext} from './EnemyCraftContext';
import {useEnemyMissileContext} from './EnemyMissileContext';
import {IconProps} from 'Game/types';

interface EnemyCraftProps {
  craftColor?: string;
  Icon: React.FC<IconProps>;
  score: number;
}

const EnemyCraft = ({
  craftColor = Colors.RED,
  Icon,
  score,
}: EnemyCraftProps): null | JSX.Element => {
  const {
    facing,
    isEliminated,
    leftAnim,
    topAnim,
    onEliminationAnimationEnd,
    onRotationChange,
  } = useEnemyCraftContext();
  const missileProps = useEnemyMissileContext();
  const [isAwaitingMissileAnimEnd, setIsAwaitingMissileAnimEnd] =
    useState(false);

  useEffect(() => {
    if (isAwaitingMissileAnimEnd && !missileProps.hasMissileFired) {
      onEliminationAnimationEnd();
    }
  }, [
    isAwaitingMissileAnimEnd,
    missileProps.hasMissileFired,
    onEliminationAnimationEnd,
  ]);

  return (
    <Craft
      Icon={Icon}
      isEliminated={isEliminated}
      facing={facing}
      fill={craftColor}
      left={leftAnim}
      top={topAnim}
      onEliminationEnd={() => {
        if (missileProps.hasMissileFired) {
          setIsAwaitingMissileAnimEnd(true);
        } else {
          onEliminationAnimationEnd();
        }
      }}
      rotationListener={onRotationChange}
      score={score}
    />
  );
};

export default EnemyCraft;
