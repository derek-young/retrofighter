import React, {useEffect} from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import BootSplash from 'react-native-bootsplash';

import Catalog from './Catalog';
import Game from './Game';
import Login from './Login';
import {AppContextProvider} from './AppContext';

const Stack = createNativeStackNavigator();

const App = (): JSX.Element => {
  useEffect(() => {
    BootSplash.hide({fade: true}).catch(() => {});
  }, []);

  return (
    <NavigationContainer>
      <AppContextProvider>
        <StatusBar hidden />
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{headerShown: false}}>
          <Stack.Screen name="Catalog" component={Catalog} />
          <Stack.Screen
            name="Game"
            component={Game}
            options={{gestureEnabled: false, orientation: 'landscape'}}
          />
          <Stack.Screen
            name="Login"
            component={Login}
            options={{orientation: 'portrait'}}
          />
        </Stack.Navigator>
      </AppContextProvider>
    </NavigationContainer>
  );
};

export default App;
