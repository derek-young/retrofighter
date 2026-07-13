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
import {ItemKind, PLAYER_ID} from 'Game/engine/Simulation';
import {useSimulationContext} from 'Game/engine/SimulationContext';
import {useGameContext} from 'Game/GameContext';

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
  clusterBombCount: number;
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
  clusterBombCount: 0,
};

const ItemFactoryContext = React.createContext(defaultValue);

export const useItemFactoryContext = () => useContext(ItemFactoryContext);

export const ItemFactoryProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const simulation = useSimulationContext();
  const {consumeCarriedEffects} = useGameContext();
  const [items, setItems] = useState<ActiveItem[]>([]);
  const [effects, setEffects] = useState<Record<string, CraftItemEffects>>({});
  const itemsRef = useRef(items);
  const nextItemKeyRef = useRef(0);
  const nextSpawnAtRef = useRef(itemSpawnDelayMs);

  itemsRef.current = items;

  const setEffect = useCallback(
    (craftId: string, effect: 'hasShield' | 'isCloaked', value: boolean) =>
      setEffects(prev => ({
        ...prev,
        [craftId]: {...noEffects, ...prev[craftId], [effect]: value},
      })),
    [],
  );

  const setClusterBombCount = useCallback(
    (craftId: string, count: number) =>
      setEffects(prev => ({
        ...prev,
        [craftId]: {...noEffects, ...prev[craftId], clusterBombCount: count},
      })),
    [],
  );

  // Effects activate through these grants; the simulation invokes the end
  // callback when the effect is spent, expires, or the craft respawns.
  const grantShield = useCallback(
    (craftId: string) => {
      simulation.setShielded(craftId, true, () =>
        setEffect(craftId, 'hasShield', false),
      );
      setEffect(craftId, 'hasShield', true);
    },
    [setEffect, simulation],
  );

  const grantCloak = useCallback(
    (craftId: string, durationMs: number) => {
      simulation.setCloaked(craftId, durationMs, () =>
        setEffect(craftId, 'isCloaked', false),
      );
      setEffect(craftId, 'isCloaked', true);
    },
    [setEffect, simulation],
  );

  // Cluster bombs stockpile: arming raises the count, and the simulation
  // reports every count change (pickup, fire, respawn).
  const grantClusterBomb = useCallback(
    (craftId: string) =>
      simulation.armClusterBomb(craftId, count =>
        setClusterBombCount(craftId, count),
      ),
    [setClusterBombCount, simulation],
  );

  const onPickedUp = useCallback(
    (key: number, kind: ItemKind, craftId: string) => {
      setItems(prev => prev.filter(item => item.key !== key));

      switch (kind) {
        case 'shield':
          grantShield(craftId);
          break;
        case 'cloak':
          grantCloak(craftId, cloakDurationMs);
          break;
        case 'clusterBomb':
          grantClusterBomb(craftId);
          break;
      }
    },
    [grantClusterBomb, grantCloak, grantShield],
  );

  const onPickedUpRef = useRef(onPickedUp);

  onPickedUpRef.current = onPickedUp;

  // Power-ups the player carried over from the previous level are re-applied
  // to this level's fresh simulation on mount.
  useEffect(() => {
    const carried = consumeCarriedEffects();

    if (!carried) {
      return;
    }

    if (carried.hasShield) {
      grantShield(PLAYER_ID);
    }
    if (carried.cloakRemainingMs > 0) {
      grantCloak(PLAYER_ID, carried.cloakRemainingMs);
    }
    for (let i = 0; i < carried.clusterBombCount; i++) {
      grantClusterBomb(PLAYER_ID);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
