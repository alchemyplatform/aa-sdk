import { RNAlchemySigner } from "@account-kit/react-native-signer";
import type { ClientStoreConfig } from "../../store/types.js";

export const createSigner = (params: ClientStoreConfig) => {
  const { client, sessionConfig } = params;

  return RNAlchemySigner({
    client,
    sessionConfig,
  });
};
