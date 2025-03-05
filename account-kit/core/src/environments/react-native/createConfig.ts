import { RNAlchemySigner } from "@account-kit/react-native-signer";
import type {
  AlchemyAccountsConfig,
  BaseCreateConfigProps,
} from "../../types.js";
import { createConfig as createCoreConfig } from "../../createConfig.js";
import type { ClientStoreConfig } from "../../store/types.js";

export const createConfig = (
  params: BaseCreateConfigProps
): AlchemyAccountsConfig => {
  const createSigner = (config: ClientStoreConfig) => RNAlchemySigner(config);

  if (!params.transport) {
    throw new Error("transport is required");
  }

  return createCoreConfig({
    ...params,
    createSigner,
  });
};
