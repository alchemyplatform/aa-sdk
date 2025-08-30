import { defaultAccountState } from "../store/store.js";
import type { AlchemyAccountsConfig } from "../types.js";

/**
 * Switches the mode for a ModularAccountV2 account by clearing the existing account state.
 * This forces the account to be recreated with the new mode.
 * 
 * @param config The Alchemy accounts configuration
 * @param mode The new mode to switch to ("default" or "7702")
 */
export function switchAccountMode(
  config: AlchemyAccountsConfig,
  mode: "default" | "7702"
): void {
  const chain = config.store.getState().chain;
  const existingConfig = config.store.getState().accountConfigs[chain.id]?.ModularAccountV2;
  
  // Only clear if there's an actual mode change
  if (existingConfig && existingConfig.mode !== mode) {
    console.log(`Switching account mode from ${existingConfig.mode} to ${mode}`);
    
    config.store.setState((state) => ({
      accounts: {
        ...state.accounts,
        [chain.id]: {
          ...state.accounts![chain.id],
          ModularAccountV2: defaultAccountState(),
        },
      },
      accountConfigs: {
        ...state.accountConfigs,
        [chain.id]: {
          ...state.accountConfigs[chain.id],
          ModularAccountV2: undefined,
        },
      },
      smartAccountClients: {
        ...state.smartAccountClients,
        [chain.id]: {
          ...state.smartAccountClients[chain.id],
          ModularAccountV2: undefined,
        },
      },
    }));
  }
}