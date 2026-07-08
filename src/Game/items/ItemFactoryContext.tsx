import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  cloakDurationMs,
  itemSpawnDelayMs,
  itemSpawnIntervalMs,
} from 'Game/constants';
import {ItemKind} from 'Game/engine/Simulation';
import {useSimulationContext} from 'Game/engine/SimulationContext';

import {getItemSpawnPosition} from './itemUtils';

const itemKinds: ItemKind[] = ['shield', 'cloak', 'clusterBomb'];

// The spawner compares the pause-safe simulation clock against the next
// spawn time on a coarse interval, so pausing needs no timer bookkeeping.
const spawnPollMs = 500;

export interface ActiveItem {
  key: number;
  kind: ItemKind;
  top: number;
  left: number;
}

export interface CraftItemEffects {
  hasShield: boolean;
  isCloaked: boolean;
  hasClusterBomb: boolean;
}

interface ItemFactoryContextValue {
  effects: Record<string, CraftItemEffects>;
  items: ActiveItem[];
}

const defaultValue: ItemFactoryContextValue = {
  effects: {},
  items: [],
};

const noEffects: CraftItemEffects = {
  hasShield: false,
  isCloaked: false,
  hasClusterBomb: false,
};

const ItemFactoryContext = React.createContext(defaultValue);

export const useItemFactoryContext = () => useContext(ItemFactoryContext);

export const ItemFactoryProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const simulation = useSimulationContext();
  const [items, setItems] = useState<ActiveItem[]>([]);
  const [effects, setEffects] = useState<Record<string, CraftItemEffects>>({});
  const itemsRef = useRef(items);
  const nextItemKeyRef = useRef(0);
  const nextSpawnAtRef = useRef(itemSpawnDelayMs);

  itemsRef.current = items;

  const setEffect = useCallback(
    (craftId: string, effect: keyof CraftItemEffects, value: boolean) =>
      setEffects(prev => ({
        ...prev,
        [craftId]: {...noEffects, ...prev[craftId], [effect]: value},
      })),
    [],
  );

  const onPickedUp = useCallback(
    (key: number, kind: ItemKind, craftId: string) => {
      setItems(prev => prev.filter(item => item.key !== key));

      // Items auto-activate for whoever grabs them; the simulation invokes
      // the end callback when the effect is spent, expires, or the craft
      // respawns.
      switch (kind) {
        case 'shield':
          simulation.setShielded(craftId, true, () =>
            setEffect(craftId, 'hasShield', false),
          );
          setEffect(craftId, 'hasShield', true);
          break;
        case 'cloak':
          simulation.setCloaked(craftId, cloakDurationMs, () =>
            setEffect(craftId, 'isCloaked', false),
          );
          setEffect(craftId, 'isCloaked', true);
          break;
        case 'clusterBomb':
          simulation.armClusterBomb(craftId, () =>
            setEffect(craftId, 'hasClusterBomb', false),
          );
          setEffect(craftId, 'hasClusterBomb', true);
          break;
      }
    },
    [setEffect, simulation],
  );

  const onPickedUpRef = useRef(onPickedUp);

  onPickedUpRef.current = onPickedUp;

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (
        itemsRef.current.length > 0 ||
        simulation.getElapsedMs() < nextSpawnAtRef.current
      ) {
        return;
      }

      nextSpawnAtRef.current = simulation.getElapsedMs() + itemSpawnIntervalMs;

      const key = nextItemKeyRef.current++;
      const kind = itemKinds[Math.floor(Math.random() * itemKinds.length)];
      const position = getItemSpawnPosition(
        simulation.getCraftPositions().map(craft => craft.position),
      );

      setItems(prev => [...prev, {key, kind, ...position}]);
      simulation.addItem(`item-${key}`, {
        kind,
        ...position,
        onPickedUp: craftId => onPickedUpRef.current(key, kind, craftId),
      });
    }, spawnPollMs);

    return () => clearInterval(intervalId);
  }, [simulation]);

  const value = useMemo(() => ({effects, items}), [effects, items]);

  return (
    <ItemFactoryContext.Provider value={value}>
      {children}
    </ItemFactoryContext.Provider>
  );
};
