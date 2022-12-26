import React, {useEffect, useRef, useState} from 'react';
import {Animated, Easing, StyleSheet, View} from 'react-native';

import EnemyCargoShipIcon from 'icons/enemy-cargo.svg';
import {
  arenaSize,
  craftPixelsPerSecond,
  craftSize,
  Enemies,
  enemyPoints,
} from 'Game/constants';
import Colors from 'types/colors';

import {
  EnemyCraftContextProvider,
  useEnemyCraftContext,
} from './EnemyCraftContext';
import EnemyCraft from './EnemyCraft';
import {useEnemyFactoryContext} from './EnemyFactoryContext';
import {EnemyProps} from './enemyProps';

const styles = StyleSheet.create({
  radarWave: {
    borderWidth: 3,
    borderColor: Colors.RED,
    opacity: 0.4,
    position: 'absolute',
    zIndex: -100,
  },
});

const RadarWave = ({
  left,
  top,
  waveSize,
}: {
  left: number;
  top: number;
  waveSize: number;
}) => {
  return (
    <View
      pointerEvents="none"
      style={[
        styles.radarWave,
        {
          left,
          top,
          height: waveSize,
          width: waveSize,
          borderRadius: waveSize / 2,
        },
      ]}
    />
  );
};

const EnemyCargoShip = ({id}: {id: number}): JSX.Element | null => {
  const {addEnemy, removeEnemy} = useEnemyFactoryContext();
  const {isPlayerInLineOfSight, leftAnim, topAnim} = useEnemyCraftContext();
  const [fixedLeft, setFixedLeft] = useState(null);
  const [fixedTop, setFixedTop] = useState(null);
  const [hasWaveAnimationEnded, setHasWaveAnimationEnded] = useState(false);
  const [craftOpacity, setCraftOpacity] = useState(1);
  const [waveSize, setWaveSize] = useState(0);
  const craftOpacityAnimation = useRef(new Animated.Value(1));
  const waveAnimation = useRef(new Animated.Value(0));

  const hasFixedValue = fixedLeft !== null && fixedTop !== null;

  const opacityValueListener = ({value}: {value: number}) =>
    setCraftOpacity(value);
  const waveValueListener = ({value}: {value: number}) => setWaveSize(value);

  useEffect(() => {
    craftOpacityAnimation.current.addListener(opacityValueListener);
    waveAnimation.current.addListener(waveValueListener);
  }, []);

  useEffect(() => {
    if (isPlayerInLineOfSight) {
      // @ts-ignore
      setFixedLeft(leftAnim._value);
      // @ts-ignore
      setFixedTop(topAnim._value);
    }
  }, [isPlayerInLineOfSight, leftAnim, topAnim]);

  useEffect(() => {
    if (fixedLeft !== null && fixedTop !== null) {
      leftAnim.setValue(fixedLeft);
      topAnim.setValue(fixedTop);
    }
  }, [fixedLeft, fixedTop, leftAnim, topAnim]);

  useEffect(() => {
    if (hasFixedValue) {
      Animated.timing(waveAnimation.current, {
        easing: Easing.linear,
        duration: 1500,
        toValue: arenaSize,
        useNativeDriver: true,
      }).start(() => setHasWaveAnimationEnded(true));
    }
  }, [hasFixedValue]);

  useEffect(() => {
    if (hasWaveAnimationEnded) {
      Animated.timing(craftOpacityAnimation.current, {
        duration: 2000,
        toValue: 0,
        useNativeDriver: true,
      }).start(() => {
        addEnemy(Enemies.SPEEDER, {
          startingLeft: fixedLeft ?? 0,
          startingTop: fixedTop ?? 0,
        });
        setTimeout(() => {
          addEnemy(Enemies.SPEEDER, {
            startingLeft: fixedLeft ?? 0,
            startingTop: fixedTop ?? 0,
          });
        }, 300);
        setTimeout(() => {
          addEnemy(Enemies.SPEEDER, {
            startingLeft: fixedLeft ?? 0,
            startingTop: fixedTop ?? 0,
          });
        }, 600);
        setTimeout(() => removeEnemy(id), 600);
      });
    }
  }, [addEnemy, fixedLeft, fixedTop, hasWaveAnimationEnded, removeEnemy, id]);

  return (
    <>
      <View style={{opacity: craftOpacity}}>
        <EnemyCraft
          Icon={EnemyCargoShipIcon}
          score={enemyPoints[Enemies.CARGO_SHIP]}
        />
      </View>
      {hasFixedValue && !hasWaveAnimationEnded && (
        <>
          <RadarWave
            left={fixedLeft - waveSize / 2 + craftSize / 2}
            top={fixedTop - waveSize / 2 + craftSize / 2}
            waveSize={waveSize}
          />
          {waveSize - 80 > 0 ? (
            <RadarWave
              left={fixedLeft - (waveSize - 80) / 2 + craftSize / 2}
              top={fixedTop - (waveSize - 80) / 2 + craftSize / 2}
              waveSize={waveSize - 80}
            />
          ) : null}
          {waveSize - 160 > 0 ? (
            <RadarWave
              left={fixedLeft - (waveSize - 160) / 2 + craftSize / 2}
              top={fixedTop - (waveSize - 160) / 2 + craftSize / 2}
              waveSize={waveSize - 160}
            />
          ) : null}
        </>
      )}
    </>
  );
};

export default (props: EnemyProps) => {
  return (
    <EnemyCraftContextProvider
      defaultCraftSpeed={craftPixelsPerSecond * 0.6}
      {...props}>
      <EnemyCargoShip id={props.id} />
    </EnemyCraftContextProvider>
  );
};
