import type { ClientWithAlchemyMethods } from "@account-kit/core";
import type { AlchemyAccountsConfig } from "../types";

export const watchBundlerClient =
  (config: AlchemyAccountsConfig) =>
  (onChange: (bundlerClient: ClientWithAlchemyMethods) => void) => {
    return config.coreStore.subscribe(
      ({ bundlerClient }) => bundlerClient,
      onChange
    );
  };
