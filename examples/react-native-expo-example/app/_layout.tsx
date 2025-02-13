// Add global shims
import "node-libs-react-native/globals.js";
import "react-native-get-random-values";
import "@walletconnect/react-native-compat";
import "node-window-polyfill/register";


import React from "react";
import { Stack } from "expo-router";
import { createAccountKitStore, createConfig } from "@account-kit/core";
import { alchemy, arbitrumSepolia } from "@account-kit/infra";
import { QueryClient } from "@tanstack/react-query";
import { PAYMASTER_POLICY_ID, API_KEY } from "@env";
import { AccountkitProvider } from "../src/AccountkitProvider";

const alchemyConfig = createConfig({
	transport: alchemy({ apiKey: API_KEY }),
	chain: arbitrumSepolia,
	ssr: false,
	policyId: PAYMASTER_POLICY_ID,
	signerConnection: {
		apiKey: API_KEY,
	},
	 
  });

console.log("ALCHEMY Signer", alchemyConfig.store.getState().signer);

const queryClient = new QueryClient()
  
  
export default function RootLayout() {
	return (
		<AccountkitProvider config={alchemyConfig} queryClient={queryClient}>
			<Stack>
				<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
			</Stack>
		</AccountkitProvider>
	);
}
