import React from 'react';

import {Enemies} from 'Game/constants';

import EnemyCraft from './EnemyCraft';
import {EnemyCraftContextProvider} from './EnemyCraftContext';
import EnemyMissile from './EnemyMissile';
import {EnemyMissileProvider} from './EnemyMissileContext';
import {EnemyBodyProps, enemyClasses} from './enemyClasses';
import {EnemyProps} from './enemyProps';

// The standard render tree shared by every class without a bespoke Body: an
// optional missile (present only when the tree is wrapped in
// EnemyMissileProvider below) painted before the craft so the craft covers it.
function StandardEnemyBody({enemyClass}: EnemyBodyProps): JSX.Element {
  return (
    <>
      {enemyClass.hasMissile && <EnemyMissile />}
      <EnemyCraft
        craftColor={enemyClass.craftColor}
        Icon={enemyClass.Icon}
        score={enemyClass.score}
      />
    </>
  );
}

interface EnemyComponentProps extends EnemyProps {
  enemyName: Enemies;
}

const Enemy = ({
  enemyName,
  ...enemyProps
}: EnemyComponentProps): JSX.Element => {
  const enemyClass = enemyClasses[enemyName];
  const Body = enemyClass.Body ?? StandardEnemyBody;
  const body = <Body enemyClass={enemyClass} id={enemyProps.id} />;

  return (
    <EnemyCraftContextProvider
      aiClass={enemyClass.aiClass}
      craftSpeedWhenLockedOn={enemyClass.craftSpeedWhenLockedOn}
      defaultCraftSpeed={enemyClass.defaultCraftSpeed}
      defaultFacing={enemyClass.defaultFacing}
      freezeWhenPlayerDetected={enemyClass.freezeWhenPlayerDetected}
      {...enemyProps}>
      {enemyClass.hasMissile ? (
        <EnemyMissileProvider>{body}</EnemyMissileProvider>
      ) : (
        body
      )}
    </EnemyCraftContextProvider>
  );
};

export default React.memo(Enemy);
