import React from 'react';

import {AiClass} from './useEnemyCraftAnimation';
import VeteranChevrons from './VeteranChevrons';

// The hull insignia for each AI class. Adding a class's marker is a one-line
// entry here — no new booleans threaded through the render tree.
export const aiClassInsignia: Partial<
  Record<AiClass, React.FC<{fill: string}>>
> = {
  veteran: VeteranChevrons,
};
