import React from 'react';
import {ImageBackground, ScrollView, StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {useAppContext} from 'AppContext';
import {CatalogNavigationProp} from 'types/app';
import {Enemies, enemyPoints, startingEnemies} from 'Game/constants';
import pyramidsImage from 'images/backdrop_catalog.jpg';
import TransparentSafeAreaView from 'components/TransparentSafeAreaView';

import CatalogButton from './CatalogButton';
import DogTag from './DogTag';

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
});

const pointsForLevel = {
  ...enemyPoints,
  [Enemies.CARGO_SHIP]: 400,
};

const levels = startingEnemies.map(enemies =>
  enemies.reduce((totalPointsPossible, enemyName) => {
    if (enemyName === null) {
      return totalPointsPossible;
    }

    return totalPointsPossible + pointsForLevel[enemyName];
  }, 0),
);

const Catalog = (): JSX.Element => {
  const {scores} = useAppContext();
  const navigation = useNavigation<CatalogNavigationProp>();

  return (
    <ImageBackground
      source={pyramidsImage}
      resizeMode="cover"
      style={styles.background}>
      <TransparentSafeAreaView />
      <DogTag />
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {levels.map((pointsPossible, level) => {
            const earned = scores[level] ?? 0;
            const hasCompletedPreviousLevel =
              level === 0 || Boolean(scores[level - 1]);

            return (
              <CatalogButton
                key={level}
                disabled={!hasCompletedPreviousLevel}
                earned={earned}
                level={level}
                onPress={() => navigation.navigate('Game', {epic: level})}
                possible={pointsPossible}
              />
            );
          })}
        </ScrollView>
      </View>
      <TransparentSafeAreaView />
    </ImageBackground>
  );
};

export default Catalog;
