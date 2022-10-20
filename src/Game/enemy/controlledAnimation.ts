import {getNextAlley, isVerticalFacing} from 'Game/utils';
import {Facing} from 'Game/types';
import {totalWidth} from 'Game/gameConstants';

import {AnimationProps} from './enemyAnimation';

function getPositionOfPlayerCraft(
  facing: Facing,
  playerTop: number,
  playerLeft: number,
) {
  const playerPosition = isVerticalFacing(facing) ? playerTop : playerLeft;
  const isPlayerFlushToAlley = playerPosition % totalWidth < 10;
  const nextAlley = getNextAlley(playerPosition, facing);

  console.log('playerPosition', playerPosition);
  console.log('isPlayerFlushToAlley', isPlayerFlushToAlley);

  return (isPlayerFlushToAlley ? nextAlley : nextAlley - 1) * totalWidth;
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
