/**
 * React Native stub for WebProvider
 * This file prevents Metro from importing web-specific code
 */

export function AlchemyProvider() {
  throw new Error(
    "WebProvider is not available in React Native. " +
      'Import from "@account-kit/privy-integration/react-native" instead.',
  );
}
