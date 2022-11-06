import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import Catalog from './Catalog';
import Game from './Game';
import Login from './Login';

const Stack = createNativeStackNavigator();

const App = (): JSX.Element => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Game"
        screenOptions={{headerShown: false}}>
        <Stack.Screen name="Catalog" component={Catalog} />
        <Stack.Screen
          name="Game"
          component={Game}
          options={{orientation: 'landscape'}}
        />
        <Stack.Screen name="Login" component={Login} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
