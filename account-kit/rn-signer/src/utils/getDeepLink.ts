import { Platform } from "react-native";
export const getDeepLink = (path = "") => {
  const scheme = "rn-signer-demo";
  const prefix =
    Platform.OS === "android" ? `${scheme}://my-host/` : `${scheme}://`;
  return prefix + path;
};
