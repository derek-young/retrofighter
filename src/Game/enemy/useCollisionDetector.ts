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
  isEliminated: boolean;
  leftAnim: Animated.Value;
  topAnim: Animated.Value;
  startingLeft: number;
  startingTop: number;
  setIsEliminated: (isEliminated: boolean) => void;
}

function useCollisionDetector({
  hasPlayerMoved,
  isEliminated,
  leftAnim,
  topAnim,
  startingLeft,
  startingTop,
  setIsEliminated,
}: CollisionDetectorProps) {
  const {leftRef: playerLeftRef, topRef: playerTopRef} = useAnimationContext();
  const {handleIsPlayerEliminated, isEliminated: isPlayerEliminated} =
    useEliminationContext();
  const leftRef = useRef<number>(startingLeft);
  const topRef = useRef<number>(startingTop);
  const checkCraftOverlapRef = useRef(() => {});
  const hasPlayerMovedRef = useRef(hasPlayerMoved);
  const isEliminatedRef = useRef(isEliminated);
  const isPlayerEliminatedRef = useRef(isPlayerEliminated);

  hasPlayerMovedRef.current = hasPlayerMoved;
  isEliminatedRef.current = isEliminated;
  isPlayerEliminatedRef.current = isPlayerEliminated;

  const checkCraftOverlap = useCallback(() => {
    if (
      !hasPlayerMovedRef.current ||
      isEliminatedRef.current ||
      isPlayerEliminatedRef.current
    ) {
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

  checkCraftOverlapRef.current = checkCraftOverlap;

  useEffect(() => {
    leftAnim.addListener(({value}) => {
      leftRef.current = value;
      checkCraftOverlapRef.current();
    });
    topAnim.addListener(({value}) => {
      topRef.current = value;
      checkCraftOverlapRef.current();
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}

export default useCollisionDetector;
