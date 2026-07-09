import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, View} from 'react-native';
import {SvgProps} from 'react-native-svg';

import Colors from 'types/colors';
import ClusterBombIcon from 'icons/cluster-bomb.svg';
import CloakIcon from 'icons/cloak.svg';
import ShieldIcon from 'icons/shield.svg';
import {craftSize} from 'Game/constants';
import {ItemKind} from 'Game/engine/Simulation';

import {ActiveItem, useItemFactoryContext} from './ItemFactoryContext';

const kindColors: Record<ItemKind, string> = {
  shield: Colors.SKY_BLUE,
  cloak: Colors.DEEP_PURPLE,
  clusterBomb: Colors.ORANGE,
};

const kindIcons: Record<ItemKind, React.FC<SvgProps>> = {
  shield: ShieldIcon,
  cloak: CloakIcon,
  clusterBomb: ClusterBombIcon,
};

const itemIconSize = 18;

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
});

const ItemView = ({item}: {item: ActiveItem}) => {
  const pulseAnim = useRef(new Animated.Value(0.9)).current;
  const Icon = kindIcons[item.kind];

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
      <Icon
        fill={kindColors[item.kind]}
        height={itemIconSize}
        width={itemIconSize}
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
