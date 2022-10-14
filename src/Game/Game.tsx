import React, {useEffect, useRef, useState} from 'react';
import {Animated, Easing, Dimensions, StyleSheet, View} from 'react-native';
import {RouteProp} from '@react-navigation/native';

import {RootStackParamList} from 'types/app';
import Colors from 'types/colors';

import Arena from './Arena';
import ButtonSet from './ButtonSet';
import DPad from './DPad';
import {Facing} from './Arena/Craft';

const PADDING = 56;

const styles = StyleSheet.create({
  game: {
    flex: 1,
    flexDirection: 'row',
    paddingLeft: PADDING,
    paddingRight: PADDING,
    backgroundColor: Colors.PURPLE,
  },
});

type GameRouteParam = RouteProp<RootStackParamList, 'Game'>;

type GameProps = {
  route?: GameRouteParam;
};

type UpdaterProps = {
  value: number;
};

const windowHeight = Dimensions.get('window').height;
const minTop = 0;
const maxTop = windowHeight - 22;
const minLeft = 0;
const maxLeft = windowHeight - 22;
const topAnimValue = new Animated.Value(maxTop);
const leftAnimValue = new Animated.Value(minLeft);
const pixelsPerSecond = 60;

function animate({
  animation,
  pixelsToMove,
  toValue,
}: {
  animation: Animated.Value;
  pixelsToMove: number;
  toValue: number;
}) {
  const durationMs = (pixelsToMove / pixelsPerSecond) * 1000;

  Animated.timing(animation, {
    toValue,
    duration: durationMs,
    easing: Easing.linear,
    useNativeDriver: false,
  }).start();
}

const Game = ({route}: GameProps): JSX.Element => {
  const epic = route?.params?.epic;
  console.log('epic', epic);

  const [facing, setFacing] = useState<Facing>('N');
  const topAnim = useRef(topAnimValue).current;
  const leftAnim = useRef(leftAnimValue).current;
  const topRef = useRef(maxTop);
  const leftRef = useRef(minLeft);
  const topUpdaterRef = useRef<(props: UpdaterProps) => void>(
    ({value}: UpdaterProps) => (topRef.current = value),
  );
  const leftUpdaterRef = useRef<(props: UpdaterProps) => void>(
    ({value}: UpdaterProps) => (leftRef.current = value),
  );

  useEffect(() => {
    topAnimValue.addListener(topUpdaterRef.current);
    leftAnimValue.addListener(leftUpdaterRef.current);
  }, []);

  const onDownPress = () => {
    const pixelsToMove = maxTop - topRef.current;

    leftAnim.stopAnimation();
    animate({animation: topAnim, pixelsToMove, toValue: maxTop});
    setFacing('S');
  };

  const onUpPress = () => {
    const pixelsToMove = topRef.current;

    leftAnim.stopAnimation();
    animate({animation: topAnim, pixelsToMove, toValue: minTop});
    setFacing('N');
  };

  const onLeftPress = () => {
    const pixelsToMove = leftRef.current;

    topAnim.stopAnimation();
    animate({animation: leftAnim, pixelsToMove, toValue: minLeft});
    setFacing('W');
  };

  const onRightPress = () => {
    const pixelsToMove = maxLeft - leftRef.current;

    topAnim.stopAnimation();
    animate({animation: leftAnim, pixelsToMove, toValue: maxLeft});
    setFacing('E');
  };

  return (
    <View style={styles.game}>
      <DPad
        onDownPress={onDownPress}
        onUpPress={onUpPress}
        onLeftPress={onLeftPress}
        onRightPress={onRightPress}
        padding={PADDING}
      />
      <Arena topAnim={topAnim} leftAnim={leftAnim} facing={facing} />
      <ButtonSet />
    </View>
  );
};

export default Game;
