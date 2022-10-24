import {MissilePosition, MissilePositionCallback} from './types';

const missilePositionFactory = (): MissilePosition => {
  const listeners: MissilePositionCallback[] = [];

  return {
    addListener: (listener: MissilePositionCallback) =>
      listeners.push(listener),
    getListeners: () => listeners,
  };
};

export default missilePositionFactory;
