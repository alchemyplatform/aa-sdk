import type { WalletClientConfig, WalletClient } from "./types.js";

/**
 * Creates a new wallet client instance
 *
 * @param {WalletClientConfig} config - The configuration for the wallet client
 * @returns {WalletClient} A wallet client instance
 */
export function createWalletClient(config: WalletClientConfig): WalletClient {
  let connected = false;

  return {
    getConfig() {
      return { ...config };
    },

    async connect() {
      // Example implementation - replace with actual connection logic
      connected = true;
    },

    async disconnect() {
      // Example implementation - replace with actual disconnection logic
      connected = false;
    },

    isConnected() {
      return connected;
    },
  };
}
