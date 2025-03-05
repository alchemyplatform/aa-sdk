import { createConfig as createCoreConfig } from "../../createConfig.js";
import type { ClientStoreConfig } from "../../store/types.js";
import type { AlchemyAccountsConfig } from "../../types.js";

import type { BaseCreateConfigProps } from "../../types.js";
import { createSigner as createWebSigner } from "./createSigner.js";

export const createConfig = (
  params: BaseCreateConfigProps
): AlchemyAccountsConfig => {
  const createSigner = (config: ClientStoreConfig) => {
    return createWebSigner(config);
  };
  return createCoreConfig({
    ...params,
    createSigner,
  });
};
