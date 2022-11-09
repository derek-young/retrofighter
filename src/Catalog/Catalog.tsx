import React from 'react';
import {SafeAreaView, StyleSheet, Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {CatalogNavigationProp} from 'types/app';

import CatalogButton from './CatalogButton';
import DogTag from './DogTag';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#7A04EB',
  },
  version: {
    position: 'absolute',
    left: 32,
    bottom: 32,
    color: 'red',
  },
});

const Catalog = (): JSX.Element => {
  const navigation = useNavigation<CatalogNavigationProp>();

  return (
    <SafeAreaView style={styles.container}>
      <DogTag />
      <CatalogButton onPress={() => navigation.navigate('Game', {epic: 0})}>
        Level 1
      </CatalogButton>
      <CatalogButton
        disabled
        onPress={() => navigation.navigate('Game', {epic: 1})}>
        Level 2
      </CatalogButton>
      <CatalogButton onPress={() => navigation.navigate('Game', {epic: 2})}>
        Level 3
      </CatalogButton>
      <CatalogButton onPress={() => navigation.navigate('Game', {epic: 3})}>
        Level 4
      </CatalogButton>
      <CatalogButton onPress={() => navigation.navigate('Game', {epic: 4})}>
        Level 5
      </CatalogButton>
      <Text style={styles.version}>v.1.7</Text>
    </SafeAreaView>
  );
};

export default Catalog;
