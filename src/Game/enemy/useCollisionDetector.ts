import {useCallback, useEffect, useRef} from 'react';
import {Animated} from 'react-native';

import {useAnimationContext} from 'Game/Fighter/AnimationContext';
import {useEliminationContext} from 'Game/Fighter/EliminationContext';
import {useMissileContext} from 'Game/Fighter/MissileContext';
import {craftSize, totalWidth} from 'Game/gameConstants';

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

type MissileImpactChecker = (
  position: {
    missileLeft: number;
    missileTop: number;
  },
  onMissileImpact: () => void,
) => void;

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
  const playerMissiles = useMissileContext();
  const {handleIsPlayerEliminated} = useEliminationContext();
  const leftRef = useRef<number>(startingLeft);
  const topRef = useRef<number>(startingTop);
  const checkCraftOverlapRef = useRef(() => {});
  const checkMissileImpactRef = useRef<null | MissileImpactChecker>(null);
  const hasPlayerMovedRef = useRef(hasPlayerMoved);
  const isEliminatedRef = useRef(isEliminated);

  hasPlayerMovedRef.current = hasPlayerMoved;
  isEliminatedRef.current = isEliminated;

  const checkCraftOverlap = useCallback(() => {
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

  checkCraftOverlapRef.current = checkCraftOverlap;

  const checkMissileImpact = useCallback(
    (
      position: {missileLeft: number; missileTop: number},
      onMissileImpact: () => void,
    ) => {
      const {missileLeft, missileTop} = position;
      const craftLeftAlley = Math.round(leftRef.current / totalWidth);
      const craftTopAlley = Math.round(topRef.current / totalWidth);
      const missileLeftAlley = Math.round(missileLeft / totalWidth);
      const missileTopAlley = Math.round(missileTop / totalWidth);

      if (
        craftLeftAlley === missileLeftAlley &&
        craftTopAlley === missileTopAlley
      ) {
        setIsEliminated(true);
        onMissileImpact();
      }
    },
    [setIsEliminated],
  );

  checkMissileImpactRef.current = checkMissileImpact;

  useEffect(() => {
    leftAnim.addListener(({value}) => {
      if (isEliminatedRef.current) {
        return;
      }
      leftRef.current = value;
      checkCraftOverlapRef.current();
    });
    topAnim.addListener(({value}) => {
      topRef.current = value;
      checkCraftOverlapRef.current();
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    playerMissiles.forEach(({missilePosition, onMissileImpact}) => {
      missilePosition.addListener(({top, left}) => {
        if (isEliminatedRef.current) {
          return;
        }

        if (checkMissileImpactRef.current) {
          checkMissileImpactRef.current(
            {missileLeft: left, missileTop: top},
            onMissileImpact,
          );
        }
      });
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}

export default useCollisionDetector;
