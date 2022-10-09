import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import Epics from './Epics';
import Login from './Login';

const Stack = createNativeStackNavigator();

const App = (): JSX.Element => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{headerShown: false}}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Epics" component={Epics} />
        {/* <Stack.Screen name="Epics" component={Epics} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
