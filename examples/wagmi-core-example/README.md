# wagmi-core-example (Alchemy Smart Wallet + wagmi)

This is a minimal web example demonstrating the `alchemySmartWallet` connector using an injected owner connector (e.g., MetaMask).

- No legacy Signer/Auth
- Uses `@alchemy/wagmi-core` for the `alchemySmartWallet` export

## Setup

1. Install deps:

```
cd examples/connectors-web-example
yarn
```

2. Set your Alchemy API key (optional; demo key is used by default):

```
echo "VITE_ALCHEMY_API_KEY=<your-api-key>" > .env
```

3. Start dev server:

```
yarn dev
```

Open http://localhost:5173 and connect with your injected wallet. The Alchemy Smart Wallet connector wraps the injected owner to enable smart account actions.

## Notes

- The example imports `alchemySmartWallet` from `@alchemy/wagmi-core`.
- The wagmi config sets Alchemy HTTP endpoints for chains (using demo keys by default).
