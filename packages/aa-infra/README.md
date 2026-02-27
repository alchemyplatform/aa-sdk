# @alchemy/aa-infra

Alchemy Account Abstraction infrastructure utilities. Provides Rundler-specific fee estimation and RPC types for use with viem's bundler client.

## Installation

```bash
npm install @alchemy/aa-infra @alchemy/common viem
```

## Key Exports

- **`estimateFeesPerGas`** - Custom fee estimation using Alchemy's `rundler_maxPriorityFeePerGas` RPC method. Pass this as `userOperation.estimateFeesPerGas` when creating a viem `BundlerClient` pointed at Alchemy's Rundler.
- **`RundlerClient`** / **`RundlerRpcSchema`** - TypeScript types extending viem's `BundlerClient` with Rundler-specific RPC methods

## Usage

```ts
import { estimateFeesPerGas } from "@alchemy/aa-infra";
import { createBundlerClient } from "viem/account-abstraction";
import { sepolia } from "viem/chains";
import { alchemyTransport } from "@alchemy/common";

const bundlerClient = createBundlerClient({
  chain: sepolia,
  transport: alchemyTransport({ apiKey: "YOUR_API_KEY" }),
  userOperation: {
    estimateFeesPerGas,
  },
});
```

## License

MIT
