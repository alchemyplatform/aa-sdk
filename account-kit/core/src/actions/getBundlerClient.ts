import type { ClientWithAlchemyMethods } from "@account-kit/infra";
import type { AlchemyAccountsConfig } from "../types";

export const getBundlerClient = (
  config: AlchemyAccountsConfig
): ClientWithAlchemyMethods => {
  return config.coreStore.getState().bundlerClient;
};
