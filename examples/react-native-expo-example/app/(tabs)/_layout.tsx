import FontAwesome6 from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function TabLayout() {
	return (
		
			<Tabs screenOptions={{ tabBarActiveTintColor: "blue" }}>
				<Tabs.Screen
				name="index" // Magic Link Auth
				options={{
					title: "Magic Link",
					tabBarIcon: ({ color }) => (
						<FontAwesome6 size={28} name="magic" color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="otp-auth"
				options={{
					title: "OTP Auth",
					tabBarIcon: ({ color }) => (
						<FontAwesome6 size={28} name="key" color={color} />
						),
					}}
				/>
			</Tabs>
		
	);
}
