import FontAwesome6 from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "blue" }}>
      <Tabs.Screen
        name="index" // Magic Link Auth
        options={{
          title: "OTP Auth",
          tabBarIcon: ({ color }) => (
            <FontAwesome6 size={28} name="key" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="oauth"
        options={{
          title: "OAuth",
          tabBarIcon: ({ color }) => (
            <FontAwesome6 size={28} name="google" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
