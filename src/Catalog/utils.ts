import {AuthUser} from 'AppContext';
import {
  getCumulativeKillPoints,
  getFullClearScore,
  getHalfParTimeBonus,
  getLevelCount,
} from 'Game/utils';

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

const roundToTen = (score: number) => Math.round(score / 10) * 10;

// The ranks below Admiral track completion progress: Fleet Captain is a full
// clear (every level's kill points, a par-time run), and the four ranks
// beneath it fall at evenly spaced level-completion milestones. Admiral alone
// demands mastery on top of completion — a full clear with every level
// finished at half its par time. All derived from the level data so the
// ladder holds as levels and scoring change.
const fullClearScore = getFullClearScore();
const admiralThreshold = fullClearScore + getHalfParTimeBonus();
const levelCount = getLevelCount();

// Lieutenant … Captain: the score after completing 1/5, 2/5, 3/5, 4/5 of the
// levels. Fleet Captain caps the ladder at a full clear.
const completionThresholds = [1, 2, 3, 4].map(step =>
  roundToTen(getCumulativeKillPoints(Math.round((step / 5) * levelCount) - 1)),
);

const rankThresholds = [
  ...completionThresholds,
  roundToTen(fullClearScore),
  roundToTen(admiralThreshold),
];

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

export function formatScore(score: number): string {
  return score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatTime(seconds: number): string {
  const wholeSeconds = Math.floor(seconds);
  const minutes = Math.floor(wholeSeconds / 60);
  const remainder = wholeSeconds % 60;

  return `${minutes}:${remainder.toString().padStart(2, '0')}`;
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
