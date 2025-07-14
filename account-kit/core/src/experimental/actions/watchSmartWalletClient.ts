import type { AlchemyAccountsConfig } from "../../types";
import {
  getSmartWalletClient,
  type GetSmartWalletClientResult,
} from "./getSmartWalletClient.js";

export function watchSmartWalletClient(config: AlchemyAccountsConfig) {
  return (onChange: (client: GetSmartWalletClientResult) => void) => {
    return config.store.subscribe(
      ({ signerStatus, chain }) => ({ signerStatus, chain }),
      () => {
        onChange(getSmartWalletClient(config));
      },
      {
        equalityFn(a, b) {
          return a.signerStatus === b.signerStatus && a.chain === b.chain;
        },
      },
    );
  };
}
