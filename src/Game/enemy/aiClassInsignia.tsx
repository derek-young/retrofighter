import React from 'react';

import {AiClass} from './useEnemyCraftAnimation';
import CommanderChevrons from './CommanderChevrons';

// The hull insignia for AI traits that have one; a craft renders one per
// trait. Veterans have no insignia — they are distinguished by their red hull
// colour (see EnemyCraft).
export const aiClassInsignia: Partial<Record<AiClass, React.FC<{fill: string}>>> = {
  commander: CommanderChevrons,
};
