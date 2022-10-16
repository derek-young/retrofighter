import {Dimensions} from 'react-native';

import {CRAFT_SIZE} from './Arena/Craft';

export const alleyWidth = CRAFT_SIZE + 2; // Column height/width
export const numColumns = 12;
export const pixelsPerSecond = 60; // Craft speed

export const windowHeight = Dimensions.get('window').height;
export const seperatorWidth = (windowHeight - numColumns * alleyWidth) / 11;
export const maxTop = windowHeight - 22;
export const minTop = 0;
export const maxLeft = windowHeight - 22;
export const minLeft = 0;
