import React, {useEffect, useState} from 'react';

import Colors from 'types/colors';
import Craft from 'Game/Craft';
import {useItemFactoryContext} from 'Game/items/ItemFactoryContext';
import ShieldVisual from 'Game/items/ShieldVisual';

import EnemyClusterBombMissile from './EnemyClusterBombMissile';
import {aiClassInsignia} from './aiClassInsignia';
import {useEnemyCraftContext} from './EnemyCraftContext';
import {useEnemyMissileContext} from './EnemyMissileContext';
import {AiClass} from './useEnemyCraftAnimation';
import {IconProps} from 'Game/types';

interface EnemyCraftProps {
  aiClass?: AiClass;
  craftColor?: string;
  Icon: React.FC<IconProps>;
  score: number;
}

const EnemyCraft = ({
  aiClass,
  craftColor = Colors.RED,
  Icon,
  score,
}: EnemyCraftProps): null | JSX.Element => {
  const {
    clusterMissileProps,
    facing,
    isEliminated,
    leftAnim,
    topAnim,
    onEliminationAnimationEnd,
    onRotationEnd,
    rotationAnim,
    simId,
  } = useEnemyCraftContext();
  const missileProps = useEnemyMissileContext();
  const {effects} = useItemFactoryContext();
  const [isAwaitingMissileAnimEnd, setIsAwaitingMissileAnimEnd] =
    useState(false);
  const craftEffects = effects[simId];
  // A cloaked enemy is nearly invisible to the player; the simulation still
  // treats it as a full threat.
  const fill = craftEffects?.isCloaked ? `${craftColor}26` : craftColor;
  const Insignia = aiClass ? aiClassInsignia[aiClass] : undefined;
  const hasMissileFired =
    missileProps.hasMissileFired || clusterMissileProps.hasMissileFired;

  useEffect(() => {
    if (isAwaitingMissileAnimEnd && !hasMissileFired) {
      onEliminationAnimationEnd();
    }
  }, [isAwaitingMissileAnimEnd, hasMissileFired, onEliminationAnimationEnd]);

  return (
    <>
      {!isEliminated && craftEffects?.hasShield && (
        <ShieldVisual facing={facing} left={leftAnim} top={topAnim} />
      )}
      <EnemyClusterBombMissile />
      <Craft
        Icon={Icon}
        isEliminated={isEliminated}
        facing={facing}
        fill={fill}
        insignia={Insignia ? <Insignia fill={fill} /> : undefined}
        left={leftAnim}
        top={topAnim}
        onEliminationEnd={() => {
          if (hasMissileFired) {
            setIsAwaitingMissileAnimEnd(true);
          } else {
            onEliminationAnimationEnd();
          }
        }}
        onRotationEnd={onRotationEnd}
        rotationAnim={rotationAnim}
        simId={simId}
        score={score}
      />
    </>
  );
};

export default EnemyCraft;
