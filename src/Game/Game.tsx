import React, {useEffect, useRef, useState} from 'react';
import {Animated, StyleSheet, View} from 'react-native';
import {RouteProp} from '@react-navigation/native';

import {RootStackParamList} from 'types/app';
import Colors from 'types/colors';

import Arena from './Arena';
import ButtonSet from './ButtonSet';
import DPad from './DPad';

import {
  alleyWidth,
  leftRightPadding,
  maxLeft,
  minLeft,
  maxTop,
  minTop,
  seperatorWidth,
} from './gameConstants';
import {Facing} from './types';
import {animate, getNextAlley} from './utils';

type GameRouteParam = RouteProp<RootStackParamList, 'Game'>;

type GameProps = {
  route?: GameRouteParam;
};

type UpdaterProps = {
  value: number;
};

const styles = StyleSheet.create({
  game: {
    flex: 1,
    flexDirection: 'row',
    paddingLeft: leftRightPadding,
    paddingRight: leftRightPadding,
    backgroundColor: Colors.PURPLE,
  },
});

const startTop = maxTop;
const startLeft = minLeft;
const topAnimValue = new Animated.Value(startTop);
const leftAnimValue = new Animated.Value(startLeft);

const Game = ({route}: GameProps): JSX.Element => {
  const epic = route?.params?.epic;
  console.log('epic', epic);

  const [facing, setFacing] = useState<Facing>('N');
  const facingRef = useRef(facing);

  const topAnim = useRef(topAnimValue).current;
  const leftAnim = useRef(leftAnimValue).current;

  const topRef = useRef(startTop);
  const leftRef = useRef(startLeft);

  const nextRowRef = useRef(getNextAlley(startTop, facing));
  const nextColRef = useRef(getNextAlley(startLeft, facing));

  facingRef.current = facing;

  const topUpdaterRef = useRef<(props: UpdaterProps) => void>(
    ({value}: UpdaterProps) => {
      nextRowRef.current = getNextAlley(value, facingRef.current);
      topRef.current = value;
    },
  );
  const leftUpdaterRef = useRef<(props: UpdaterProps) => void>(
    ({value}: UpdaterProps) => {
      nextColRef.current = getNextAlley(value, facingRef.current);
      leftRef.current = value;
    },
  );

  useEffect(() => {
    topAnimValue.addListener(topUpdaterRef.current);
    leftAnimValue.addListener(leftUpdaterRef.current);
  }, []);

  const interceptVerticalAnimation = (callback: () => void) => {
    const nextRowPosition =
      nextRowRef.current * (alleyWidth + seperatorWidth) + 1;

    animate({
      animation: topAnim,
      callback,
      pixelsToMove: Math.abs(nextRowPosition - topRef.current) + 1,
      toValue: nextRowPosition,
    });
  };

  const interceptHorizontalAnimation = (callback: () => void) => {
    const nextColPosition =
      nextColRef.current * (alleyWidth + seperatorWidth) + 1;

    animate({
      animation: leftAnim,
      callback,
      pixelsToMove: Math.abs(nextColPosition - leftRef.current),
      toValue: nextColPosition,
    });
  };

  const onDownPress = () => {
    interceptHorizontalAnimation(() => {
      const pixelsToMove = maxTop - topRef.current;

      leftAnim.stopAnimation();
      animate({animation: topAnim, pixelsToMove, toValue: maxTop});
      setFacing('S');
    });
  };

  const onUpPress = () => {
    interceptHorizontalAnimation(() => {
      const pixelsToMove = topRef.current;

      leftAnim.stopAnimation();
      animate({animation: topAnim, pixelsToMove, toValue: minTop});
      setFacing('N');
    });
  };

  const onLeftPress = () => {
    interceptVerticalAnimation(() => {
      const pixelsToMove = leftRef.current;

      topAnim.stopAnimation();
      animate({animation: leftAnim, pixelsToMove, toValue: minLeft});
      setFacing('W');
    });
  };

  const onRightPress = () => {
    interceptVerticalAnimation(() => {
      const pixelsToMove = maxLeft - leftRef.current;

      topAnim.stopAnimation();
      animate({animation: leftAnim, pixelsToMove, toValue: maxLeft});
      setFacing('E');
    });
  };

  return (
    <View style={styles.game}>
      <DPad
        onDownPress={onDownPress}
        onUpPress={onUpPress}
        onLeftPress={onLeftPress}
        onRightPress={onRightPress}
      />
      <Arena topAnim={topAnim} leftAnim={leftAnim} facing={facing} />
      <ButtonSet />
    </View>
  );
};

export default Game;
