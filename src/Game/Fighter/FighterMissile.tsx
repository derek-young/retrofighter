import React, {useMemo} from 'react';
import {Animated} from 'react-native';

import {missileSize} from 'Game/constants';
import Missile from 'Game/Missile';
import ClusterBombIcon from 'icons/cluster-bomb.svg';
import MissileIcon from 'icons/missile.svg';
import {PLAYER_ID} from 'Game/engine/Simulation';
import {IconProps, MissileAnimationProps} from 'Game/types';

interface FighterMissileProps
  extends Omit<
    MissileAnimationProps,
    'Icon' | 'ownerId' | 'rotationAnim' | 'targetKind'
  > {
  craftColor: string;
  craftRotationAnim: Animated.Value;
  iconStyle: Record<string, unknown>;
}

const FighterMissile = ({
  craftColor,
  craftRotationAnim,
  iconStyle,
  isClusterBomb,
  ...rest
}: FighterMissileProps) => {
  const Icon = useMemo(
    () =>
      function FighterMissileIcon({style}: IconProps) {
        // The cluster bomb has its own upright icon; missile.svg is drawn at
        // 45° and needs straightening.
        const IconGraphic = isClusterBomb ? ClusterBombIcon : MissileIcon;

        return (
          <IconGraphic
            fill={craftColor}
            height={missileSize}
            width={missileSize}
            style={{
              ...(style as object),
              ...iconStyle,
              transform: isClusterBomb ? undefined : [{rotate: '-45deg'}],
            }}
          />
        );
      },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [craftColor, isClusterBomb],
  );

  return (
    <Missile
      Icon={Icon}
      isClusterBomb={isClusterBomb}
      ownerId={PLAYER_ID}
      rotationAnim={craftRotationAnim}
      targetKind="enemy"
      {...rest}
    />
  );
};

export default FighterMissile;
