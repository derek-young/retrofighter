import React from 'react';
import {ImageBackground, StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {CatalogNavigationProp} from 'types/app';
import {enemyPoints, startingEnemies} from 'Game/constants';
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
    alignItems: 'center',
  },
});

const epics = startingEnemies.map(enemies =>
  enemies.reduce((totalPointsPossible, enemyName) => {
    if (enemyName === null) {
      return totalPointsPossible;
    }

    return totalPointsPossible + enemyPoints[enemyName];
  }, 0),
);

const Catalog = (): JSX.Element => {
  const navigation = useNavigation<CatalogNavigationProp>();

  return (
    <ImageBackground
      source={pyramidsImage}
      resizeMode="cover"
      style={styles.background}>
      <TransparentSafeAreaView />
      <View style={styles.container}>
        <DogTag />
        {epics.map((pointsPossible, epic) => (
          <CatalogButton
            key={epic}
            onPress={() => navigation.navigate('Game', {epic})}
            possible={pointsPossible}>
            {`Level ${epic + 1}`}
          </CatalogButton>
        ))}
      </View>
      <TransparentSafeAreaView />
    </ImageBackground>
  );
};

export default Catalog;
