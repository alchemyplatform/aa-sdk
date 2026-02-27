# @alchemy/smart-accounts

Viem-compatible smart account implementations for Alchemy's smart contract accounts. Supports LightAccount, Modular Account v1, and Modular Account v2 with EIP-7702.

## Installation

```bash
npm install @alchemy/smart-accounts @alchemy/common viem
```

## Key Exports

### LightAccount

- **`toLightAccount`** - Single-owner LightAccount
- **`toMultiOwnerLightAccount`** - Multi-owner variant
- **`predictLightAccountAddress`** / **`predictMultiOwnerLightAccountAddress`** - Counterfactual address prediction
- **`singleOwnerLightAccountActions`** / **`multiOwnerLightAccountActions`** - Client decorators

### Modular Account v1 (ERC-6900)

- **`toMultiOwnerModularAccountV1`** - Account constructor
- **`multiOwnerModularAccountV1Actions`** - Client decorator
- **`predictMultiOwnerModularAccountV1Address`** - Address prediction

### Modular Account v2

- **`toModularAccountV2`** - Account constructor with EIP-7702 support
- **`deferralActions`** / **`installValidationActions`** - Client decorators
- **Modules** - `AllowlistModule`, `NativeTokenLimitModule`, `PaymasterGuardModule`, `SingleSignerValidationModule`, `TimeRangeModule`
- **`PermissionBuilder`** - Fluent builder for session key permissions
- **Signature utilities** - `packUOSignature`, `pack1271Signature`, `toReplaySafeTypedData`

## License

MIT
