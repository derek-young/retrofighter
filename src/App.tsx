import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import Catalog from './Catalog';
import Game from './Game';
import Login from './Login';
import {AppContextProvider} from './AppContext';

const Stack = createNativeStackNavigator();

const App = (): JSX.Element => {
  return (
    <AppContextProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{headerShown: false}}>
          <Stack.Screen
            name="Catalog"
            component={Catalog}
            options={{orientation: 'portrait'}}
          />
          <Stack.Screen
            name="Game"
            component={Game}
            options={{orientation: 'landscape'}}
          />
          <Stack.Screen
            name="Login"
            component={Login}
            options={{orientation: 'portrait'}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AppContextProvider>
  );
};

export default App;
