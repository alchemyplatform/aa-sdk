// Add global shims
import "node-libs-react-native/globals.js";
import "react-native-get-random-values";

import {AlchemyAccountProvider} from "@account-kit/rn"
import {alchemy, sepolia} from '@account-kit/infra'
import { QueryClient } from "@tanstack/react-query";
import { API_KEY } from "@env";

import React from "react";
import { Stack } from "expo-router";

const queryClient = new QueryClient()

export default function RootLayout() {
	const configParams = ({
		chain: sepolia,
		transport: alchemy({
			apiKey: API_KEY!
		}),
		signerConnection: {
			apiKey: API_KEY!
		}
	})
	return (
		<AlchemyAccountProvider params={configParams} queryClient={queryClient}>
			<Stack>
				<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
			</Stack>
		</AlchemyAccountProvider>
		
	);
}
