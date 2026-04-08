# @alchemy/common

**Beta** — This is a low-level package that is consumed by other Alchemy packages.

## Installation

```bash
npm install @alchemy/common viem
```

## Key Exports

- **`alchemyTransport`** - viem-compatible HTTP transport for Alchemy APIs (supports API key, JWT, or direct URL auth)
- **Chain registry** - `getAlchemyRpcUrl`, `isChainSupported`, `getSupportedChainIds`
- **Custom chain definitions** (via `@alchemy/common/chains`) - chains not yet in viem
- **`AlchemyRestClient`** - typed REST client for non-JSON-RPC Alchemy APIs
- **Error classes** - `BaseError`, `ChainNotFoundError`, `AccountNotFoundError`, `ConnectionConfigError`, etc.
- **Logging** - `createLogger`, `setGlobalLoggerConfig`, `LogLevel`
- **Utilities** - `bigIntMultiply`, `bigIntMax`, `lowerAddress`, `assertNever`

## Usage

```ts
import { alchemyTransport } from "@alchemy/common";
import { sepolia } from "viem/chains";
import { createPublicClient } from "viem";

const client = createPublicClient({
  chain: sepolia,
  transport: alchemyTransport({ apiKey: "YOUR_API_KEY" }),
});
```

## License

MIT
