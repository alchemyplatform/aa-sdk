import { RNAlchemySigner } from "@account-kit/react-native-signer";
import Config from "react-native-config";

const signer = RNAlchemySigner({
  client: {
    connection: { apiKey: requireConfig("API_KEY") },
    rpId: requireConfig("RP_ID"),
  },
});

function requireConfig(key: string) {
  const value = Config[key];
  if (!value) {
    throw new Error(`${key} should be set in .env`);
  }
  return value;
}

export default signer;
