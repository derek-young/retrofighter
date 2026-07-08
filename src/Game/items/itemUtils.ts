import {numColumns, totalWidth} from 'Game/constants';
import {Position} from 'Game/engine/Simulation';

/**
 * Picks a grid intersection for an item spawn that maximizes the minimum
 * Manhattan distance to every craft (player included, so neither side gets
 * the item handed to them). A random pick among near-best candidates keeps
 * the spot unpredictable.
 */
export function getItemSpawnPosition(craftPositions: Position[]): Position {
  const candidates: Array<{position: Position; score: number}> = [];
  let bestScore = 0;

  for (let row = 0; row < numColumns; row++) {
    for (let column = 0; column < numColumns; column++) {
      const position = {top: row * totalWidth, left: column * totalWidth};
      const score = craftPositions.reduce(
        (minDistance, craft) =>
          Math.min(
            minDistance,
            Math.abs(craft.top - position.top) +
              Math.abs(craft.left - position.left),
          ),
        Number.MAX_VALUE,
      );

      candidates.push({position, score});
      bestScore = Math.max(bestScore, score);
    }
  }

  const eligible = candidates.filter(({score}) => score >= bestScore * 0.9);

  return eligible[Math.floor(Math.random() * eligible.length)].position;
}
