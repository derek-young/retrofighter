import React from 'react';
import {SvgProps} from 'react-native-svg';

import Colors from 'types/colors';
import Craft from 'Game/Craft';

import {useEnemyCraftContext} from './EnemyCraftContext';

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

  return (
    <Craft
      Icon={Icon}
      isEliminated={isEliminated}
      facing={facing}
      fill={craftColor}
      left={leftAnim}
      top={topAnim}
      onEliminationEnd={onEliminationAnimationEnd}
      rotationListener={onRotationChange}
    />
  );
};

export default EnemyCraft;
