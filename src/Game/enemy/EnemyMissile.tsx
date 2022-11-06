import React from 'react';
import {alleyWidth, missileSize} from 'Game/constants';
import Missile from 'Game/Missile';
import EnemyMissileIcon from 'icons/skull.svg';

import {useEnemyCraftContext} from './EnemyCraftContext';
import {useEnemyMissileContext} from './EnemyMissileContext';

interface EnemyMissileProps {
  missileColor?: string;
}

const leftOffset = 4;

const EnemyMissile = ({
  missileColor = '#FF0042',
}: EnemyMissileProps): null | JSX.Element => {
  const {craftRotation, facing, leftAnim, topAnim} = useEnemyCraftContext();
  const missileProps = useEnemyMissileContext();

  return (
    <Missile
      craftRotation={craftRotation}
      facing={facing}
      Icon={({style}) => (
        <EnemyMissileIcon
          fill={missileColor}
          height={missileSize}
          width={missileSize}
          style={{...style, left: leftOffset}}
        />
      )}
      leftAnim={leftAnim}
      topAnim={topAnim}
      missileProps={missileProps}
      positionOffset={alleyWidth / 2}
    />
  );
};

export default EnemyMissile;
