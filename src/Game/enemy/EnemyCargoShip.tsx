import React, {useEffect, useRef, useState} from 'react';
import {Animated, Easing, StyleSheet} from 'react-native';

import EnemyCargoShipIcon from 'icons/enemy-cargo.svg';
import {
  arenaSize,
  craftPixelsPerSecond,
  craftSize,
  Enemies,
  enemyPoints,
} from 'Game/constants';
import Colors from 'types/colors';
import {Position} from 'Game/engine/Simulation';

import {EnemyCraftContextProvider, useEnemyCraftContext} from './EnemyCraftContext';
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
    height: arenaSize,
    width: arenaSize,
    borderRadius: arenaSize / 2,
  },
});

const RadarWave = ({
  center,
  waveAnim,
  waveOffset,
}: {
  center: Position;
  waveAnim: Animated.Value;
  waveOffset: number;
}) => {
  // Each wave renders at full size and scales up from the detection point;
  // scale 0 keeps trailing waves invisible until their offset is reached.
  const scale = waveAnim.interpolate({
    inputRange: [waveOffset, arenaSize + waveOffset],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.radarWave,
        {
          left: center.left - arenaSize / 2 + craftSize / 2,
          top: center.top - arenaSize / 2 + craftSize / 2,
          transform: [{scale}],
        },
      ]}
    />
  );
};

const EnemyCargoShip = ({id}: {id: number}): JSX.Element | null => {
  const {addEnemy, removeEnemy} = useEnemyFactoryContext();
  const {frozenPosition} = useEnemyCraftContext();
  const [hasWaveAnimationEnded, setHasWaveAnimationEnded] = useState(false);
  const craftOpacityAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (frozenPosition) {
      Animated.timing(waveAnim, {
        easing: Easing.linear,
        duration: 1500,
        toValue: arenaSize,
        useNativeDriver: true,
      }).start(() => setHasWaveAnimationEnded(true));
    }
  }, [frozenPosition, waveAnim]);

  useEffect(() => {
    if (hasWaveAnimationEnded) {
      Animated.timing(craftOpacityAnim, {
        duration: 2000,
        toValue: 0,
        useNativeDriver: true,
      }).start(() => {
        const position = {
          startingLeft: frozenPosition?.left ?? 0,
          startingTop: frozenPosition?.top ?? 0,
        };

        addEnemy(Enemies.SPEEDER, position);
        setTimeout(() => addEnemy(Enemies.SPEEDER, position), 300);
        setTimeout(() => addEnemy(Enemies.SPEEDER, position), 600);
        setTimeout(() => removeEnemy(id), 600);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addEnemy, hasWaveAnimationEnded, removeEnemy, id]);

  return (
    <>
      <Animated.View style={{opacity: craftOpacityAnim}}>
        <EnemyCraft
          Icon={EnemyCargoShipIcon}
          score={enemyPoints[Enemies.CARGO_SHIP]}
        />
      </Animated.View>
      {frozenPosition && !hasWaveAnimationEnded && (
        <>
          <RadarWave center={frozenPosition} waveAnim={waveAnim} waveOffset={0} />
          <RadarWave
            center={frozenPosition}
            waveAnim={waveAnim}
            waveOffset={0}
          />
          <RadarWave
            center={frozenPosition}
            waveAnim={waveAnim}
            waveOffset={80}
          />
          <RadarWave
            center={frozenPosition}
            waveAnim={waveAnim}
            waveOffset={160}
          />
        </>
      )}
    </>
  );
};

export default React.memo((props: EnemyProps) => {
  return (
    <EnemyCraftContextProvider
      defaultCraftSpeed={craftPixelsPerSecond * 0.6}
      freezeWhenPlayerDetected
      {...props}>
      <EnemyCargoShip id={props.id} />
    </EnemyCraftContextProvider>
  );
});
