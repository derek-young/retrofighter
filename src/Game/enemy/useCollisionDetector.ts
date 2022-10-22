import {useCallback, useEffect, useRef} from 'react';
import {Animated} from 'react-native';

import {useAnimationContext} from 'Game/Fighter/AnimationContext';
import {useEliminationContext} from 'Game/Fighter/EliminationContext';
import {craftSize} from 'Game/gameConstants';

function getArea(top: number, left: number) {
  return [
    [top, left],
    [top, left + craftSize],
    [top + craftSize, left],
    [top + craftSize, left + craftSize],
  ];
}

function doAreasIntersect(
  top: number,
  left: number,
  playerTop: number,
  playerLeft: number,
) {
  const playerArea = getArea(playerTop, playerLeft);

  return playerArea.some(corner => {
    const doesTopIntersect = corner[0] >= top && corner[0] <= top + craftSize;
    const doesLeftIntersect =
      corner[1] >= left && corner[1] <= left + craftSize;

    return doesTopIntersect && doesLeftIntersect;
  });
}

interface CollisionDetectorProps {
  hasPlayerMoved: boolean;
  leftAnim: Animated.Value;
  topAnim: Animated.Value;
  startingLeft: number;
  startingTop: number;
  setIsEliminated: (isEliminated: boolean) => void;
}

function useCollisionDetector({
  hasPlayerMoved,
  leftAnim,
  topAnim,
  startingLeft,
  startingTop,
  setIsEliminated,
}: CollisionDetectorProps) {
  const {handleIsPlayerEliminated} = useEliminationContext();
  const {leftRef: playerLeftRef, topRef: playerTopRef} = useAnimationContext();
  const leftRef = useRef<number>(startingLeft);
  const topRef = useRef<number>(startingTop);
  const checkOverlapRef = useRef(() => {});
  const hasPlayerMovedRef = useRef(hasPlayerMoved);

  hasPlayerMovedRef.current = hasPlayerMoved;

  const checkOverlap = useCallback(() => {
    if (!hasPlayerMovedRef.current) {
      return;
    }

    const hasOverlap = doAreasIntersect(
      topRef.current,
      leftRef.current,
      playerTopRef.current,
      playerLeftRef.current,
    );
    if (hasOverlap) {
      handleIsPlayerEliminated();
      setIsEliminated(true);
    }
  }, [handleIsPlayerEliminated, playerLeftRef, playerTopRef, setIsEliminated]);

  checkOverlapRef.current = checkOverlap;

  useEffect(() => {
    leftAnim.addListener(({value}) => {
      leftRef.current = value;
      checkOverlapRef.current();
    });
    topAnim.addListener(({value}) => {
      topRef.current = value;
      checkOverlapRef.current();
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}

export default useCollisionDetector;
