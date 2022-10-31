import {useCallback, useEffect, useRef} from 'react';
import {Animated} from 'react-native';

import {MissileProps} from 'Game/types';
import {craftSize} from 'Game/gameConstants';

type MissileImpactChecker = (
  position: {
    missileLeft: number;
    missileTop: number;
  },
  onMissileImpact: () => void,
) => void;

interface MissileImpactDetectorProps {
  isEliminated: boolean;
  leftAnim: Animated.Value;
  topAnim: Animated.Value;
  missiles: MissileProps[];
  startingLeft: number;
  startingTop: number;
  setIsEliminated: (isEliminated: boolean) => void;
}

function useMissileImpactDetector({
  isEliminated,
  leftAnim,
  topAnim,
  missiles,
  startingLeft,
  startingTop,
  setIsEliminated,
}: MissileImpactDetectorProps) {
  const leftRef = useRef<number>(startingLeft);
  const topRef = useRef<number>(startingTop);
  const checkMissileImpactRef = useRef<null | MissileImpactChecker>(null);
  const isEliminatedRef = useRef(isEliminated);

  isEliminatedRef.current = isEliminated;

  const checkMissileImpact = useCallback<MissileImpactChecker>(
    (position, onMissileImpact) => {
      const {missileLeft, missileTop} = position;

      // console.log('checking if missile has impacted');
      // console.log('missileLeft', missileLeft);
      // console.log('missileTop', missileTop);
      // console.log('playerLeft', leftRef.current);
      // console.log('playerTop', topRef.current);

      if (
        missileLeft >= leftRef.current &&
        missileLeft <= leftRef.current + craftSize &&
        missileTop >= topRef.current &&
        missileTop <= topRef.current + craftSize
      ) {
        setIsEliminated(true);
        onMissileImpact();
      }
    },
    [setIsEliminated],
  );

  checkMissileImpactRef.current = checkMissileImpact;

  useEffect(() => {
    leftAnim.addListener(
      ({value}: {value: number}) => (leftRef.current = value),
    );
    topAnim.addListener(({value}: {value: number}) => (topRef.current = value));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    missiles.forEach(({missilePosition, onMissileImpact}) => {
      missilePosition.addListener(({left, top}) => {
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

export default useMissileImpactDetector;
