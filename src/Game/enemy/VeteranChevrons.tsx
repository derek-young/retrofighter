import React from 'react';
import {StyleSheet, View} from 'react-native';
import Svg, {Polyline} from 'react-native-svg';

import {craftSize} from 'Game/constants';

// A stack of rank chevrons painted across the middle of the hull, pointing
// toward the nose. This is the veteran marker: veterans share the normal enemy
// red, so the chevrons — not colour — are what set them apart.
const chevronColor = '#C0C0C0'; // silver
const chevronCount = 2;
const chevronWidth = 8;
const armHeight = 3;
const chevronGap = 1.5;
const strokeWidth = 1.6;

const svgWidth = chevronWidth + strokeWidth;
const svgHeight = chevronCount * (armHeight + chevronGap) + strokeWidth;

// Points for one chevron ("^") pointing up, i.e. toward the craft's nose.
function chevronPoints(row: number): string {
  const top = row * (armHeight + chevronGap) + strokeWidth / 2;
  const left = strokeWidth / 2;
  const midX = left + chevronWidth / 2;
  const right = left + chevronWidth;
  const bottom = top + armHeight;
  return `${left},${bottom} ${midX},${top} ${right},${bottom}`;
}

const rows = Array.from({length: chevronCount}, (_, row) => row);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: (craftSize - svgHeight) / 2,
    left: (craftSize - svgWidth) / 2,
  },
  shadow: {
    position: 'absolute',
    top: 0.7,
    left: 0.7,
  },
});

function Chevrons({fill}: {fill: string}) {
  return (
    <Svg width={svgWidth} height={svgHeight}>
      {rows.map((row) => (
        <Polyline
          key={row}
          points={chevronPoints(row)}
          fill="none"
          stroke={fill}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </Svg>
  );
}

// Rendered inside the craft's rotating container so the chevrons stay pinned to
// the hull and turn with it, like insignia painted on the ship. The chevrons
// keep their silver hue but take their opacity from the craft's `fill`, so a
// cloaked craft (`#RRGGBB26`) fades its insignia in lockstep with the hull.
function VeteranChevrons({fill}: {fill: string}): JSX.Element {
  const opacity = fill.length === 9 ? parseInt(fill.slice(7), 16) / 255 : 1;

  return (
    <View style={[styles.container, {opacity}]}>
      <View style={styles.shadow}>
        <Chevrons fill="#00000040" />
      </View>
      <Chevrons fill={chevronColor} />
    </View>
  );
}

export default VeteranChevrons;
