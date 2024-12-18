/* eslint-disable import/extensions */
import { createStaticNavigation } from "@react-navigation/native";
import { Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";

import OtpAuthScreen from "./screens/otp-auth";
import MagicLinkAuthScreen from "./screens/magic-link-auth";

const linking = {
  enabled: "auto" as const /* Automatically generate paths for all screens */,
  prefixes: ["rn-signer-demo://"],
};

const RootStack = createBottomTabNavigator({
  initialRouteName: "MagicLinkAuth",
  screens: {
    MagicLinkAuth: {
      screen: MagicLinkAuthScreen,
      linking: { path: "magic-link-auth" },
      options: {
        tabBarLabel: "Magic Link",
        tabBarIcon: () => <Text>🪄</Text>,
      },
    },
    OtpAuth: {
      screen: OtpAuthScreen,
      linking: { path: "otp-auth" },
      options: {
        tabBarLabel: "OTP",
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
