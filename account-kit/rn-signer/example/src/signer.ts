import { RNAlchemySigner } from "@account-kit/react-native-signer";
import Config from "react-native-config";

const signer = RNAlchemySigner({
  client: {
    connection: { apiKey: Config.API_KEY! },
  },
});

export default signer;
