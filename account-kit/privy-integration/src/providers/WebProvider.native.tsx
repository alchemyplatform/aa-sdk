/**
 * React Native stub for WebProvider
 * This file prevents Metro from importing web-specific code
 */

export function AlchemyProvider() {
  throw new Error(
    "This module requires @privy-io/react-auth which is not available in React Native. " +
      'Import from "@account-kit/privy-integration/react-native" instead.',
  );
}
