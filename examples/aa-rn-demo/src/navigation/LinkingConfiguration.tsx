/**
 * Learn more about deep linking with React Navigation
 * https://reactnavigation.org/docs/deep-linking
 * https://reactnavigation.org/docs/configuring-links
 */

import { type LinkingOptions } from "@react-navigation/native";
import { type RootStackParamList } from "types/global";

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ["accountkitboilerplate://"],
  config: {
    screens: {
      Root: {
        path: "",
        screens: {
          Login: {
            screens: {
              TabOneScreen: "Login",
            },
          },
          Web3: {
            screens: {
              TabTwoScreen: "Web3",
            },
          },
        },
      },
      Modal: "modal",
      NotFound: "*",
    },
  },
};

export default linking;
