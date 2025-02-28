// Add global shims
import "node-libs-react-native/globals.js";
import "react-native-get-random-values";

import "../utils/polyfills"

import {createConfig} from "@account-kit/core"

import { API_KEY } from "@env";

import { alchemy, sepolia } from "@account-kit/infra";
import React from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
	

	return (
		<SafeAreaProvider>
		<Stack>
				<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
		</Stack>
		</SafeAreaProvider>
		

	);
}
