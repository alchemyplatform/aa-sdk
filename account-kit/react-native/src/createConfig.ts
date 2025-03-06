import { RNAlchemySigner } from "@account-kit/react-native-signer";
import {
  createConfig as createCoreConfig,
  type AlchemyAccountsConfig,
  type BaseCreateConfigProps,
  type ClientStoreConfig,
} from "@account-kit/core";

/**
 * Creates an AlchemyAccountsConfig by using the provided parameters to configure the core settings, including the required transport. It includes a signer creation function internally.
 *
 * @param {BaseCreateConfigProps} params The base properties required for creating the config and establishing client store settings
 * @returns {AlchemyAccountsConfig} An object of type AlchemyAccountsConfig containing the configured properties
 */
export const createConfig = (
  params: BaseCreateConfigProps
): AlchemyAccountsConfig => {
  const createSigner = (config: ClientStoreConfig) => RNAlchemySigner(config);

  if (!params.transport) {
    throw new Error("transport is required");
  }

  return createCoreConfig({
    ...params,
    ssr: false,
    _internal: { createSigner },
  });
};
