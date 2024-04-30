import type { ClientWithAlchemyMethods } from "../../client/types";
import type { AlchemyAccountsConfig } from "../types";

export const watchBundlerClient =
  (config: AlchemyAccountsConfig) =>
  (onChange: (bundlerClient: ClientWithAlchemyMethods) => void) => {
    return config.coreStore.subscribe(
      ({ bundlerClient }) => bundlerClient,
      onChange
    );
  };
