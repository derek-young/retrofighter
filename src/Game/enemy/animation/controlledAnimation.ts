import {isVerticalFacing} from 'Game/utils';
import {Facing} from 'Game/types';
import {totalWidth} from 'Game/gameConstants';

import {AnimationProps} from './enemyAnimation';

function getPositionOfPlayerCraft(
  facing: Facing,
  playerTop: number,
  playerLeft: number,
) {
  const nextPosition = isVerticalFacing(facing) ? playerTop : playerLeft;

  return Math.floor(nextPosition / totalWidth) * totalWidth;
}

function controlledAnimation({
  nextFacing,
  playerLeft,
  playerTop,
}: {
  nextFacing: Facing;
  playerLeft: number;
  playerTop: number;
}): AnimationProps {
  const nextAlleyPosition = getPositionOfPlayerCraft(
    nextFacing,
    playerTop,
    playerLeft,
  );

  console.table({
    name: 'Controlled Amination',
    nextFacing,
    nextAlleyPosition,
    alley: nextAlleyPosition / totalWidth,
  });

  return {
    nextFacing,
    toValue: nextAlleyPosition,
  };
}

export default controlledAnimation;
