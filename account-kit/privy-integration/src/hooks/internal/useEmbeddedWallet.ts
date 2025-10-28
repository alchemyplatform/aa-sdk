import { useAdapter } from "../../context/AlchemyContext.js";

/**
 * Internal hook to get the Privy embedded wallet
 * Uses the platform adapter to abstract differences between web and React Native
 *
 * @internal
 * @returns {() => EmbeddedWallet} Function that returns the embedded wallet
 * @throws {Error} If embedded wallet is not found
 */
export function useEmbeddedWallet() {
  const adapter = useAdapter();
  return adapter.useEmbeddedWallet();
}
