import {AuthUser} from 'AppContext';

import rank1Insignia from 'images/rank1.png';
import rank2Insignia from 'images/rank2.png';
import rank3Insignia from 'images/rank3.png';
import rank4Insignia from 'images/rank4.png';
import rank5Insignia from 'images/rank5.png';
import rank6Insignia from 'images/rank6.png';
import rank7Insignia from 'images/rank7.png';

const rankNames = [
  'Ensign',
  'Lieutenant',
  'Lt.Commander',
  'Commander',
  'Captain',
  'Fleet Captain',
  'Admiral',
];

const rankInsignia = [
  rank1Insignia,
  rank2Insignia,
  rank3Insignia,
  rank4Insignia,
  rank5Insignia,
  rank6Insignia,
  rank7Insignia,
];

// Each rank is twice as hard to reach as the last. The Admiral threshold is
// ~75% of the theoretical maximum total (all-level base points plus time
// bonuses), so the top rank is demanding but not perfection-gated.
const rankThresholds = [1125, 2250, 4500, 9000, 18000, 36000];

export function getRankIndex(score: number): number {
  let rankIndex = 0;

  while (
    rankIndex < rankThresholds.length &&
    score >= rankThresholds[rankIndex]
  ) {
    rankIndex++;
  }

  return rankIndex;
}

export function getRank(score: number) {
  const rankIndex = getRankIndex(score);

  return rankNames[rankIndex];
}

export function getRankInsignia(score: number) {
  const rankIndex = getRankIndex(score);

  return rankInsignia[rankIndex];
}

export function getDisplayName(user: AuthUser) {
  if (user?.displayName?.length) {
    const [first, last] = user.displayName.split(' ');

    if (first?.length && last?.length) {
      return `${first[0]}.${last}`;
    }

    return first;
  }

  return 'Anonymous';
}
