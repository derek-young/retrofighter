import React, {useEffect, useRef} from 'react';
import {Animated, Easing, StyleSheet} from 'react-native';

import {craftSize} from 'Game/constants';
import Colors from 'types/colors';

// The veteran marker: red/black rings pulsing outward from the hull, implying an
// active radar that keeps the veteran alert to incoming fire.
const ringCount = 2;
const pulseDurationMs = 3600;
const maxRingSize = craftSize * 3.4;
const minScale = 0.3;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  ring: {
    position: 'absolute',
    height: maxRingSize,
    width: maxRingSize,
    borderRadius: maxRingSize / 2,
    borderWidth: 2,
    top: craftSize / 2 - maxRingSize / 2,
    left: craftSize / 2 - maxRingSize / 2,
  },
});

function Ring({
  color,
  pulse,
}: {
  color: string;
  pulse: Animated.Value;
}): JSX.Element {
  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [minScale, 1],
  });
  // Fade in quickly then out as the ring expands, so it reads as a sweep.
  const opacity = pulse.interpolate({
    inputRange: [0, 0.15, 1],
    outputRange: [0, 0.32, 0],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.ring, {borderColor: color, opacity, transform: [{scale}]}]}
    />
  );
}

// Rendered inside the craft's rotating container; the rings are radially
// symmetric, so rotation is a no-op. The whole pulse fades with the hull's
// `fill` opacity, so a cloaked veteran's radar dims in lockstep (`#RRGGBB26`).
function VeteranRadarPulse({fill}: {fill: string}): JSX.Element {
  const hullOpacity = fill.length === 9 ? parseInt(fill.slice(7), 16) / 255 : 1;
  const pulses = useRef(
    Array.from({length: ringCount}, () => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    const loops = pulses.map(pulse =>
      Animated.loop(
        Animated.timing(pulse, {
          toValue: 1,
          duration: pulseDurationMs,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ),
    );

    // Stagger the starts so the rings stay evenly spaced as each loop repeats.
    const timers = pulses.map((_, i) =>
      setTimeout(() => loops[i].start(), (pulseDurationMs / ringCount) * i),
    );

    return () => {
      timers.forEach(clearTimeout);
      loops.forEach(loop => loop.stop());
    };
  }, [pulses]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.container, {opacity: hullOpacity}]}>
      {pulses.map((pulse, i) => (
        <Ring
          key={i}
          color={i % 2 === 0 ? Colors.RED : '#3e0000'}
          pulse={pulse}
        />
      ))}
    </Animated.View>
  );
}

export default VeteranRadarPulse;
