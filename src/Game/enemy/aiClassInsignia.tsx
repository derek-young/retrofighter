import React from 'react';

import {AiClass} from './useEnemyCraftAnimation';
import CommanderChevrons from './CommanderChevrons';
import VeteranRadarPulse from './VeteranRadarPulse';

// The hull insignia for each AI trait. A craft renders one per trait it has, so
// a veteran-commander shows both. Adding a trait's marker is a one-line entry
// here — no new booleans threaded through the render tree.
export const aiClassInsignia: Record<AiClass, React.FC<{fill: string}>> = {
  veteran: VeteranRadarPulse,
  commander: CommanderChevrons,
};
