import React from 'react';

import {createStaticNavigation} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import HomeScreen from './screens/Home';

const linking = {
  enabled: 'auto' as const /* Automatically generate paths for all screens */,
  prefixes: ['rn-signer-demo://'],
};

const RootStack = createNativeStackNavigator({
  initialRouteName: 'Home',
  screens: {
    Home: {
      screen: HomeScreen,
      linking: {path: 'home'},
    },
  },
});

export default function App() {
  const Navigation = createStaticNavigation(RootStack);
  return (
    <SafeAreaProvider>
      <Navigation linking={linking} />
    </SafeAreaProvider>
  );
}
