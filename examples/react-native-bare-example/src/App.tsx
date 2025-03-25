import React from 'react';

import {createStaticNavigation} from '@react-navigation/native';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Text} from 'react-native';
import OTPAuthScreen from './screens/otp';
import {API_KEY} from '@env';
import {AlchemyAccountProvider, createConfig } from "@account-kit/react-native";
import { QueryClient } from "@tanstack/react-query";
import { sepolia } from '@account-kit/infra';
import { alchemy } from '@account-kit/infra';
import OAuthScreen from './screens/oauth';

const linking = {
  enabled: 'auto' as const /* Automatically generate paths for all screens */,
  prefixes: ['rn-signer-demo://'],
};

const RootStack = createBottomTabNavigator({
  initialRouteName: 'OTPAuthScreen',
  screens: {
    
    OTPAuthScreen: {
      screen: OTPAuthScreen,
      linking: {path: 'otp'},
      options: {
        title: 'OTP Auth',
        tabBarIcon: () => <Text>🔑</Text>,
      },
    },
    OAuthScreen: {
      screen: OAuthScreen,
      linking: {path: 'oauth'},
      options: {
        title: 'OAuth',
        tabBarIcon: () => <Text>🔐</Text>,  
      },
    },
  },
});

const queryClient = new QueryClient()

export default function App() {
  const Navigation = createStaticNavigation(RootStack);

  const alchemyConfig = createConfig({
    chain: sepolia,
		transport: alchemy({
			apiKey: API_KEY!,
		}),
		signerConnection: {
			apiKey: API_KEY!,
		},
		sessionConfig: {
			expirationTimeMs: 1000 * 60 * 60 * 24 , // <-- Adjust the session expiration time as needed (currently 24 hours)
		}
  });

  return (
    <AlchemyAccountProvider config={alchemyConfig} queryClient={queryClient}>
      <SafeAreaProvider>
        <Navigation linking={linking} />
      </SafeAreaProvider>
    </AlchemyAccountProvider>
  );
}
