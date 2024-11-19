/* eslint-disable import/extensions */
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./screens/Home";
import { createStaticNavigation } from "@react-navigation/native";

const linking = {
  enabled: "auto" as const /* Automatically generate paths for all screens */,
  prefixes: ["rn-signer-demo://"],
};

const RootStack = createNativeStackNavigator({
  screens: {
    Home: {
      screen: HomeScreen,
      linking: { path: "home" },
    },
  },
});

const Navigation = createStaticNavigation(RootStack);

export default function App() {
  return <Navigation linking={linking} />;
}
