import {createConfig, AlchemyAccountProvider} from "@account-kit/react-native"

import {alchemy, sepolia} from '@account-kit/infra'
import { QueryClient } from "@tanstack/react-query";


import React from "react";
import { Stack } from "expo-router";

const queryClient = new QueryClient()

const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

export default function RootLayout() {
	const config = createConfig({
		chain: sepolia,
		rpId: "example.com",
		transport: alchemy({
			apiKey: API_KEY!,
		}),
		signerConnection: {
			apiKey: API_KEY!,
		},
		sessionConfig: {
			expirationTimeMs: 1000 * 60 * 60 * 24 , // <-- Adjust the session expiration time as needed (currently 24 hours)
		}
	})
	
	return (
		<AlchemyAccountProvider config={config} queryClient={queryClient}>
			<Stack>
				<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
			</Stack>
		</AlchemyAccountProvider>
		
	);
}
