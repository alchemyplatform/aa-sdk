import React from 'react';

import {createStaticNavigation} from '@react-navigation/native';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Text} from 'react-native';
import MagicLinkScreen from './screens/magic-link';
import OTPAuthScreen from './screens/otp';

const linking = {
  enabled: 'auto' as const /* Automatically generate paths for all screens */,
  prefixes: ['rn-signer-demo://'],
};

const RootStack = createBottomTabNavigator({
  initialRouteName: 'MagicLinkScreen',
  screens: {
    MagicLinkScreen: {
      screen: MagicLinkScreen,
      linking: {path: 'magic-link'},
      options: {
        title: 'Magic Link',
        tabBarIcon: () => <Text>🪄</Text>,
      },
    },
    OTPAuthScreen: {
      screen: OTPAuthScreen,
      linking: {path: 'otp'},
      options: {
        title: 'OTP Auth',
        tabBarIcon: () => <Text>🔑</Text>,
      },
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
