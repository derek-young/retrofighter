import React, {useEffect, useState} from 'react';
import {SvgProps} from 'react-native-svg';

import Colors from 'types/colors';
import Craft from 'Game/Craft';

import {useEnemyCraftContext} from './EnemyCraftContext';
import {useEnemyMissileContext} from './EnemyMissileContext';

interface EnemyCraftProps {
  craftColor?: string;
  Icon: React.FC<SvgProps>;
}

const EnemyCraft = ({
  craftColor = Colors.RED,
  Icon,
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
    />
  );
};

export default EnemyCraft;
