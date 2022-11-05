import React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {RootStackParamList} from 'types/app';

import CatalogButton from './CatalogButton';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#7A04EB',
  },
});

type CatalogNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Catalog'
>;

const Catalog = (): JSX.Element => {
  const navigation = useNavigation<CatalogNavigationProp>();

  return (
    <SafeAreaView style={styles.container}>
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
    </SafeAreaView>
  );
};

export default Catalog;
