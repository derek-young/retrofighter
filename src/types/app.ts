import {NativeStackNavigationProp} from '@react-navigation/native-stack';

export type RootStackParamList = {
  Catalog: undefined;
  Game: {
    epic: number;
  };
  Login: undefined;
};

export type CatalogNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Catalog'
>;

export type GameNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Game'
>;

export type LoginNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;
