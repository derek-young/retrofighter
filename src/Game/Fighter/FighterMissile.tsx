import React, {useMemo} from 'react';
import {Animated} from 'react-native';

import {missileSize} from 'Game/constants';
import Missile from 'Game/Missile';
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
  ...rest
}: FighterMissileProps) => {
  // Memoized so the icon keeps a stable component identity across renders;
  // an inline component type would remount the SVG tree each render.
  const Icon = useMemo(
    () =>
      function FighterMissileIcon({style}: IconProps) {
        return (
          <MissileIcon
            fill={craftColor}
            height={missileSize}
            width={missileSize}
            style={{
              ...(style as object),
              ...iconStyle,
              transform: [{rotate: '-45deg'}],
            }}
          />
        );
      },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [craftColor],
  );

  return (
    <Missile
      Icon={Icon}
      ownerId={PLAYER_ID}
      rotationAnim={craftRotationAnim}
      targetKind="enemy"
      {...rest}
    />
  );
};

export default FighterMissile;
