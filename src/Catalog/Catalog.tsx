import React, {useState} from 'react';
import {ImageBackground, ScrollView, StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {useAppContext} from 'AppContext';
import {CatalogNavigationProp} from 'types/app';
import {earnablePoints, startingEnemies} from 'Game/constants';
import {getParSeconds} from 'Game/utils';
import pyramidsImage from 'images/backdrop_catalog.jpg';
import Button from 'components/Button';
import TransparentSafeAreaView from 'components/TransparentSafeAreaView';

import CatalogButton from './CatalogButton';
import DogTag from './DogTag';
import LeaderboardModal from './LeaderboardModal';

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    display: 'flex',
    alignItems: 'center',
    flexGrow: 1,
  },
  leaderboardButton: {
    alignSelf: 'center',
    marginBottom: 12,
  },
});

const levels = startingEnemies.map(enemies =>
  enemies.reduce((totalPointsPossible, enemyName) => {
    if (enemyName === null) {
      return totalPointsPossible;
    }

    return totalPointsPossible + earnablePoints[enemyName];
  }, 0),
);

const Catalog = (): JSX.Element => {
  const {bestTimes, scores, user} = useAppContext();
  const navigation = useNavigation<CatalogNavigationProp>();
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  return (
    <ImageBackground
      source={pyramidsImage}
      resizeMode="cover"
      style={styles.background}>
      <TransparentSafeAreaView />
      <DogTag />
      {user?.uid ? (
        <Button
          onPress={() => setIsLeaderboardOpen(true)}
          style={styles.leaderboardButton}>
          Leaderboard
        </Button>
      ) : null}
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {levels.map((pointsPossible, level) => {
            const earned = scores[level] ?? 0;
            const hasCompletedPreviousLevel =
              level === 0 || Boolean(scores[level - 1]);

            return (
              <CatalogButton
                key={level}
                bestTime={bestTimes[level] ?? 0}
                disabled={!hasCompletedPreviousLevel}
                earned={earned}
                level={level}
                onPress={() => navigation.navigate('Game', {epic: level})}
                parSeconds={getParSeconds(level)}
                possible={pointsPossible}
              />
            );
          })}
        </ScrollView>
      </View>
      <TransparentSafeAreaView />
      <LeaderboardModal
        onClose={() => setIsLeaderboardOpen(false)}
        open={isLeaderboardOpen}
      />
    </ImageBackground>
  );
};

export default Catalog;
