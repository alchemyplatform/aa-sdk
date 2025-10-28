/**
 * React Native stub for web Provider
 * This file prevents Metro from importing web-specific code
 */

export function AlchemyProvider() {
  throw new Error(
    "Web Provider is not available in React Native. " +
      'Import from "@account-kit/privy-integration/react-native" instead.',
  );
}

export function useAlchemyConfig() {
  throw new Error(
    "useAlchemyConfig from web Provider is not available in React Native. " +
      'Import from "@account-kit/privy-integration/react-native" instead.',
  );
}
