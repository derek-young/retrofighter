import {MissilePositionCallback} from './types';

class MissilePosition {
  listeners: MissilePositionCallback[] = [];

  addListener(listener: MissilePositionCallback): void {
    this.listeners.push(listener);
  }

  getListeners(): MissilePositionCallback[] {
    return this.listeners;
  }
}

export default MissilePosition;
