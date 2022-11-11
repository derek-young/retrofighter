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

export function getRankIndex(score: number): number {
  const rankIndex = Math.min(
    rankNames.length - 1,
    score < 1000 ? 0 : Math.floor(Math.log2(score / 1000) + 1),
  );

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
