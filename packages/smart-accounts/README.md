# @alchemy/smart-accounts

**Beta** — This package replaces `@account-kit/smart-contracts`. This is a low-level package. Most users should use [`@alchemy/wallet-apis`](https://www.alchemy.com/docs/wallets/reference/wallet-apis) unless you need to use interface with Smart Accounts directly via viem.

Viem-compatible smart account implementations for Alchemy's smart contract accounts. Supports LightAccount, Modular Account v1, and Modular Account v2 with EIP-7702.

## Installation

```bash
npm install @alchemy/smart-accounts @alchemy/common viem
```

## Example Usage

```ts
import { createPublicClient } from "viem";
import {
  createBundlerClient,
  createPaymasterClient,
} from "viem/account-abstraction";
import { sepolia } from "viem/chains";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { alchemyTransport } from "@alchemy/common";
import { estimateFeesPerGas } from "@alchemy/aa-infra";
import { toModularAccountV2 } from "@alchemy/smart-accounts";

const transport = alchemyTransport({ apiKey: "YOUR_API_KEY" });

// 1. Create a MAv2 smart account
const account = await toModularAccountV2({
  client: createPublicClient({ chain: sepolia, transport }),
  owner: privateKeyToAccount(generatePrivateKey()),
});

// 2. Create a bundler client with the account
const bundlerClient = createBundlerClient({
  account,
  chain: sepolia,
  transport,
  userOperation: {
    estimateFeesPerGas,
  },
  // Optional: sponsor gas with a paymaster
  paymaster: createPaymasterClient({ transport }),
  paymasterContext: { policyId: "YOUR_POLICY_ID" },
});

// 3. Send a user operation
const hash = await bundlerClient.sendUserOperation({
  calls: [{ to: "0x...", value: 0n, data: "0x" }],
});

const receipt = await bundlerClient.waitForUserOperationReceipt({ hash });
```

## Key Exports

### LightAccount

- **`toLightAccount`** - Single-owner LightAccount
- **`toMultiOwnerLightAccount`** - Multi-owner variant
- **`predictLightAccountAddress`** / **`predictMultiOwnerLightAccountAddress`** - Counterfactual address prediction

### Modular Account v1 (ERC-6900)

- **`toMultiOwnerModularAccountV1`** - Account constructor
- **`predictMultiOwnerModularAccountV1Address`** - Address prediction

### Modular Account v2

- **`toModularAccountV2`** - Account constructor with EIP-7702 support
- **`deferralActions`** / **`installValidationActions`** - Client decorators
- **Modules** - `AllowlistModule`, `NativeTokenLimitModule`, `PaymasterGuardModule`, `SingleSignerValidationModule`, `TimeRangeModule`
- **`PermissionBuilder`** - Fluent builder for session key permissions
- **Signature utilities** - `packUOSignature`, `pack1271Signature`, `toReplaySafeTypedData`

## License

MIT
