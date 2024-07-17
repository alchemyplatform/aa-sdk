import { disconnect as wagmi_disconnect } from "@wagmi/core";
import type { AlchemyAccountsConfig } from "../types";
import { getSigner } from "./getSigner.js";

/**
 * Disconnect the current signer, accounts, and clears the store.
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
  config.store.setState(() => config.store.getInitialState());
  config.store.persist.clearStorage();
}
