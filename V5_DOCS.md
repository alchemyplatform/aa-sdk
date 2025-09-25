# V5 Documentation Update Requirements

Based on analysis of the current documentation at https://www.alchemy.com/docs/wallets and the v5 codebase structure in `packages/common/`, `packages/smart-accounts/`, and `packages/wallet-apis/`.

## Documentation Pages Requiring V5 Updates

| Section              | Page URL                                                                       | Update Priority | Key Changes Needed                                                            |
| -------------------- | ------------------------------------------------------------------------------ | --------------- | ----------------------------------------------------------------------------- |
| **Core Integration** | https://www.alchemy.com/docs/wallets                                           | High            | Package names, imports, main overview                                         |
| **Core Integration** | https://www.alchemy.com/docs/wallets/supported-chains                          | High            | Chain handling changes from v4 to v5                                          |
| **Authentication**   | https://www.alchemy.com/docs/wallets/authentication/overview                   | High            | Import paths, client setup                                                    |
| **Authentication**   | https://www.alchemy.com/docs/wallets/authentication/* (all subsections)        | Medium          | Login methods, UI components, whitelabel, connectors, MFA, account management |
| **Authentication**   | https://www.alchemy.com/docs/wallets/third-party/signers                       | Medium          | Signer package structure changes                                              |
| **Transactions**     | https://www.alchemy.com/docs/wallets/transactions/overview                     | High            | Major changes to transaction handling                                         |
| **Transactions**     | https://www.alchemy.com/docs/wallets/transactions/send/batch-user-operations   | High            | Smart account API changes                                                     |
| **Transactions**     | https://www.alchemy.com/docs/wallets/react/pay-gas-with-any-token              | Medium          | Gas management changes                                                        |
| **Transactions**     | https://www.alchemy.com/docs/wallets/transactions/retries                      | Medium          | Client and transport changes                                                  |
| **Transactions**     | https://www.alchemy.com/docs/wallets/transactions/* (all other subsections)    | Medium          | Send, sponsor gas, 7702, low-level infra, third party infra                   |
| **SDK Reference**    | https://www.alchemy.com/docs/wallets/reference/account-kit/react               | Critical        | Account Kit React changes                                                     |
| **SDK Reference**    | https://www.alchemy.com/docs/wallets/reference/account-kit/react-native        | Critical        | React Native signer changes                                                   |
| **SDK Reference**    | https://www.alchemy.com/docs/wallets/reference/account-kit/core                | Critical        | Core package restructuring                                                    |
| **SDK Reference**    | https://www.alchemy.com/docs/wallets/reference/account-kit/infra               | Critical        | Transport and client changes                                                  |
| **SDK Reference**    | https://www.alchemy.com/docs/wallets/reference/account-kit/signer              | Critical        | Signer package separation                                                     |
| **SDK Reference**    | https://www.alchemy.com/docs/wallets/reference/account-kit/smart-contracts     | Critical        | Smart account changes                                                         |
| **SDK Reference**    | https://www.alchemy.com/docs/wallets/reference/aa-sdk/core                     | Critical        | Major package restructuring                                                   |
| **SDK Reference**    | https://www.alchemy.com/docs/wallets/reference/aa-sdk/ethers                   | Critical        | Potential deprecation/changes                                                 |
| **SDK Reference**    | https://www.alchemy.com/docs/wallets/reference/account-kit/wallet-client       | Critical        | New wallet APIs                                                               |
| **Resources**        | https://www.alchemy.com/docs/wallets/migration-guide                           | Critical        | V4→V5 migration content                                                       |
| **Resources**        | https://www.alchemy.com/docs/wallets/resources/features                        | Medium          | Feature changes in v5                                                         |
| **Resources**        | https://www.alchemy.com/docs/wallets/resources/types                           | Medium          | Type system changes                                                           |
| **Resources**        | https://www.alchemy.com/docs/wallets/resources/* (troubleshooting subsections) | Low             | General troubleshooting updates                                               |

## Pages That DON'T Need Updates

| Section     | Page URL                                                  | Reason                             |
| ----------- | --------------------------------------------------------- | ---------------------------------- |
| **Funding** | https://www.alchemy.com/docs/wallets/funding/early-access | Funding-specific, likely unchanged |

## Key V5 Changes Driving Documentation Updates

### Package Structure Changes

- **`@alchemy/common`** - New unified package for transport, chains, errors
- **`@alchemy/smart-accounts`** - Consolidated smart account functionality
- **`@alchemy/wallet-apis`** - New wallet API actions

### Smart Account Changes

- **LightAccount v2** with multi-owner support
- **ModularAccount v2** with permission system and modules:
  - AllowlistModule
  - NativeTokenLimitModule
  - PaymasterGuardModule
  - SingleSignerValidationModule
  - TimeRangeModule
  - WebAuthnValidationModule

### Transport & Client Changes

- New `alchemyTransport` API
- Enhanced chain registry system
- Improved error handling with structured error classes

### Wallet API Changes

- New action-based API: `sendCalls`, `prepareCalls`, `grantPermissions`, etc.
- Enhanced signing capabilities
- Improved account management

## Summary

- **Total Pages Requiring Updates**: ~23+ pages
- **Critical Priority**: 9 pages (mostly SDK Reference + migration guide)
- **High Priority**: 4 pages (core integration + key transaction pages)
- **Medium Priority**: 8+ pages (authentication, transactions, resources)
- **Low Priority**: 1+ pages (troubleshooting)

**Note**: This excludes API Reference pages which were mentioned as already known to need updates.
