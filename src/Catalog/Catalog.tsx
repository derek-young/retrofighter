import React from 'react';
import {ImageBackground, StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {CatalogNavigationProp} from 'types/app';
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
        <CatalogButton
          onPress={() => navigation.navigate('Game', {epic: 0})}
          stars={1}>
          Level 1
        </CatalogButton>
        <CatalogButton
          onPress={() => navigation.navigate('Game', {epic: 1})}
          stars={2}>
          Level 2
        </CatalogButton>
        <CatalogButton
          onPress={() => navigation.navigate('Game', {epic: 2})}
          stars={3}>
          Level 3
        </CatalogButton>
        <CatalogButton
          onPress={() => navigation.navigate('Game', {epic: 3})}
          stars={4}>
          Level 4
        </CatalogButton>
        <CatalogButton
          onPress={() => navigation.navigate('Game', {epic: 4})}
          stars={5}>
          Level 5
        </CatalogButton>
      </View>
      <TransparentSafeAreaView />
    </ImageBackground>
  );
};

export default Catalog;
