// Add global shims
import "node-libs-react-native/globals.js";
import "react-native-get-random-values";

import React from "react";
import { Stack } from "expo-router";

export default function RootLayout() {
	return (
		<Stack>
			<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
		</Stack>
	);
}
