import {Dimensions} from 'react-native';

import {Facing} from './types';

export const leftRightPadding = 56;

export const craftSize = 20;
export const alleyWidth = craftSize + 2; // Column height/width
export const numColumns = 12;
export const pixelsPerSecond = 60; // Craft speed

export const windowHeight = Dimensions.get('window').height;
export const seperatorWidth = (windowHeight - numColumns * alleyWidth) / 11;
export const maxTop = windowHeight - 22;
export const minTop = 0;
export const maxLeft = windowHeight - 22;
export const minLeft = 0;

export const defaultPlayerFacing: Facing = 'N';
