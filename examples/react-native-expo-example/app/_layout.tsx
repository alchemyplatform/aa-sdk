// Add global shims
import "node-libs-react-native/globals.js";
import "react-native-get-random-values";

import React from "react";
import { Stack } from "expo-router";
import { alchemy, arbitrumSepolia } from "@account-kit/infra";
import { QueryClient } from "@tanstack/react-query";
import { PAYMASTER_POLICY_ID, API_KEY } from "@env";
import { AccountkitProvider, RNAlchemySigner } from "@account-kit/react-native-signer";

const signer = RNAlchemySigner({
	client: {
		connection: {
			apiKey: API_KEY
		}
	}	
})

const alchemyConfigParams = {
	signer,
	transport: alchemy({ apiKey: API_KEY }),
	chain: arbitrumSepolia,
	ssr: false,
	policyId: PAYMASTER_POLICY_ID,
  }

const queryClient = new QueryClient()
  
export default function RootLayout() {
	return (
		<AccountkitProvider configParams={alchemyConfigParams} queryClient={queryClient}>
			<Stack>
				<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
			</Stack>
		</AccountkitProvider>
	);
}
