import type { ClientWithAlchemyMethods } from "../../client/types";
import type { AlchemyAccountsConfig } from "../types";

export const getBundlerClient = (
  config: AlchemyAccountsConfig
): ClientWithAlchemyMethods => {
  return config.coreStore.getState().bundlerClient;
};
