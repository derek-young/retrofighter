import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, View} from 'react-native';

import Colors from 'types/colors';
import {craftSize} from 'Game/constants';
import {ItemKind} from 'Game/engine/Simulation';

import {ActiveItem, useItemFactoryContext} from './ItemFactoryContext';

// TODO(Derek): replace the placeholder dots with dedicated icons
// (shield.svg, cloak.svg, cluster-bomb.svg).
const kindColors: Record<ItemKind, string> = {
  shield: Colors.SKY_BLUE,
  cloak: Colors.GREY,
  clusterBomb: Colors.PINK,
};

const dotSize = 12;

const styles = StyleSheet.create({
  // No zIndex (it breaks native-driver transforms on iOS); items render
  // under crafts by being mounted before them.
  itemContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: craftSize,
    width: craftSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemDot: {
    height: dotSize,
    width: dotSize,
    borderRadius: dotSize / 2,
    shadowColor: 'black',
    shadowOffset: {width: 1, height: 1},
    shadowOpacity: 0.4,
  },
});

const ItemView = ({item}: {item: ActiveItem}) => {
  const pulseAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.9,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    );

    pulse.start();

    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <Animated.View
      style={[
        styles.itemContainer,
        {
          transform: [
            {translateX: item.left},
            {translateY: item.top},
            {scale: pulseAnim},
          ],
        },
      ]}>
      <View
        style={[styles.itemDot, {backgroundColor: kindColors[item.kind]}]}
      />
    </Animated.View>
  );
};

const ItemsView = () => {
  const {items} = useItemFactoryContext();

  return (
    <View>
      {items.map(item => (
        <ItemView key={item.key} item={item} />
      ))}
    </View>
  );
};

export default ItemsView;
