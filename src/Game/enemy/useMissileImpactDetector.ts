import {useCallback, useEffect, useRef} from 'react';
import {Animated} from 'react-native';

import {MissileProps} from 'Game/types';
import {craftSize} from 'Game/constants';

type MissileImpactChecker = (
  position: {
    missileLeft: number;
    missileTop: number;
  },
  onMissileImpact: () => void,
) => void;

interface MissileImpactDetectorProps {
  isTargetable?: boolean;
  leftAnim: Animated.Value;
  topAnim: Animated.Value;
  missile: MissileProps;
  startingLeft: number;
  startingTop: number;
  onIsEliminated: () => void;
}

function useMissileImpactDetector({
  isTargetable = true,
  leftAnim,
  topAnim,
  missile,
  startingLeft,
  startingTop,
  onIsEliminated,
}: MissileImpactDetectorProps) {
  const leftRef = useRef<number>(startingLeft);
  const topRef = useRef<number>(startingTop);
  const checkMissileImpactRef = useRef<null | MissileImpactChecker>(null);
  const hasFiredRef = useRef(missile.hasMissileFired);
  const hasImpactedRef = useRef(missile.hasMissileImpacted);
  const isTargetableRef = useRef(isTargetable);

  hasFiredRef.current = missile.hasMissileFired;
  hasImpactedRef.current = missile.hasMissileImpacted;
  isTargetableRef.current = isTargetable;

  const checkMissileImpact = useCallback<MissileImpactChecker>(
    (position, onMissileImpact) => {
      const {missileLeft, missileTop} = position;

      if (!hasFiredRef.current || hasImpactedRef.current) {
        return;
      }

      if (
        missileLeft >= leftRef.current &&
        missileLeft <= leftRef.current + craftSize &&
        missileTop >= topRef.current &&
        missileTop <= topRef.current + craftSize
      ) {
        onIsEliminated();
        onMissileImpact();
      }
    },
    [onIsEliminated],
  );

  checkMissileImpactRef.current = checkMissileImpact;

  useEffect(() => {
    leftAnim.addListener(
      ({value}: {value: number}) => (leftRef.current = value),
    );
    topAnim.addListener(({value}: {value: number}) => (topRef.current = value));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const {missilePosition, onMissileImpact} = missile;

    missilePosition.addListener(({left, top}) => {
      if (!isTargetableRef.current) {
        return;
      }

      if (checkMissileImpactRef.current) {
        checkMissileImpactRef.current(
          {missileLeft: left, missileTop: top},
          onMissileImpact,
        );
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}

export default useMissileImpactDetector;
