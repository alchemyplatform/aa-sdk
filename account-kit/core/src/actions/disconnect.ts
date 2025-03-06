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

  // Clear Wallet Connect store
  clearWalletConnectStore();

  config.store.setState(() => config.store.getInitialState());

  config.store.setState((state) => ({
    signerStatus: convertSignerStatusToState(
      AlchemySignerStatus.DISCONNECTED,
      state.signerStatus.error
    ),
  }));
}

// Function to clear the Wallet Connect store to prevent
// Persistence of Wallet Connect connection state on error.
const clearWalletConnectStore = () => {
  // Open Wallet Connect Indexed DB
  let walletConnectDBExists = true;
  const dbOpenRequest = indexedDB.open("WALLET_CONNECT_V2_INDEXED_DB");

  dbOpenRequest.onupgradeneeded = () => {
    if (dbOpenRequest.result.version === 1) {
      walletConnectDBExists = false;

      // Remove the Database created from the indexedDB.open() call above.
      indexedDB.deleteDatabase("WALLET_CONNECT_V2_INDEXED_DB");
    }
  };

  dbOpenRequest.onsuccess = () => {
    if (!walletConnectDBExists) return;

    try {
      const db = dbOpenRequest.result;

      const txn = db.transaction(["keyvaluestorage"], "readwrite");

      const store = txn.objectStore("keyvaluestorage");

      // Clear Store
      store.clear();
    } catch (error) {
      console.error(
        "Error clearing Wallet Connect DB. Cannot clear store.",
        error
      );
    }
  };

  dbOpenRequest.onerror = () => {
    console.error("Error opening Wallet Connect DB. Cannot clear store.");
  };
};
