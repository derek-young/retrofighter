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
      <CatalogButton onPress={() => navigation.navigate('Game', {epic: 1})}>
        Epic 1
      </CatalogButton>
      <CatalogButton disabled onPress={() => console.log('epic 2')}>
        Epic 2
      </CatalogButton>
    </SafeAreaView>
  );
};

export default Catalog;
