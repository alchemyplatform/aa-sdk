import { AlchemySignerStatus } from "@account-kit/signer";
import { disconnect as wagmi_disconnect } from "@wagmi/core";
import { convertSignerStatusToState } from "../store/store.js";
import type { AlchemyAccountsConfig } from "../types";
import { getSigner } from "./getSigner.js";

/**
 * Disconnects the current signer, accounts, and clears the store.
 *
 * @example
 * ```ts
 * import { disconnect, createConfig } from "@account-kit/core";
 * import { sepolia } from "@account-kit/infra";
 *
 * const config = createConfig({
 *  chain: sepolia,
 *  apiKey: "your-api-key",
 * });
 *
 * await disconnect(config);
 * ```
 *
 * @param {AlchemyAccountsConfig} config The configuration containing the store to be cleared
 */
export async function disconnect(config: AlchemyAccountsConfig): Promise<void> {
  const signer = getSigner(config);
  await wagmi_disconnect(config._internal.wagmiConfig);
  await signer?.disconnect();

  config.store.persist.clearStorage();

  config.store.setState(() => config.store.getInitialState());

  config.store.setState((state) => ({
    signerStatus: convertSignerStatusToState(
      AlchemySignerStatus.DISCONNECTED,
      state.signerStatus.error
    ),
  }));
}
