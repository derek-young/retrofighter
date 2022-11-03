import {useEffect, useState} from 'react';

import {useAnimationContext} from 'Game/Fighter/AnimationContext';
import {playerStartLeft, playerStartTop} from 'Game/constants';

function usePlayerTracking() {
  const {leftAnim, topAnim} = useAnimationContext();
  const [playerLeft, setPlayerLeft] = useState<number>(playerStartLeft);
  const [playerTop, setPlayerTop] = useState<number>(playerStartTop);

  useEffect(() => {
    leftAnim.addListener(({value}) => setPlayerLeft(value));
    topAnim.addListener(({value}) => setPlayerTop(value));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    playerLeft,
    playerTop,
  };
}

export default usePlayerTracking;
