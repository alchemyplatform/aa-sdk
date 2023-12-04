---
outline: deep
head:
  - - meta
    - property: og:title
      content: Dynamic Integration Guide
  - - meta
    - name: description
      content: Follow this integration guide to use Dynamic as a Signer with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
  - - meta
    - property: og:description
      content: Follow this integration guide to use Dynamic as a Signer with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
  - - meta
    - name: twitter:title
      content: Dynamic Integration Guide
  - - meta
    - name: twitter:description
      content: Follow this integration guide to use Dynamic as a Signer with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
---

# Dynamic

## Integration

### Install the sdk

By default, the latest version of the Dynamic SDK ships with Viem. If you need to use Ethers, please refer to [this guide](https://docs.dynamic.xyz/react-sdk/viem-ethers#using-ethers)

In this example, we are installing only the Ethereum connectors in order to keep bundle size light. If you need any others, you can [find the references here](https://docs.dynamic.xyz/react-sdk/components/dynamiccontextprovider#walletconnectors)

::: code-group

```bash [npm]
npm i -s @dynamic-labs/sdk-react-core @dynamic-labs/ethereum
```

```bash [yarn]
yarn add @dynamic-labs/sdk-react-core @dynamic-labs/ethereum
```

:::

### Add Dynamic to your application

In order to use Dynamic, you should wrap your app with `DynamicContextProvider` at the highest possible level i.e.

```jsx
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import Home from "./Home";

// Found in your Dynamic dashboard (https://app.dynamic.xyz/dashboard/developer)
const DYNAMIC_ENVIRONMENT_ID = "XXXXX";

const App = () => {
  return (
    <div className="app">
      <DynamicContextProvider
        settings={{
          environmentId: DYNAMIC_ENVIRONMENT_ID,
          walletConnectors: [EthereumWalletConnectors],
        }}
      >
        <Home />
      </DynamicContextProvider>
    </div>
  );
};

export default App;
```

### Create a SmartAccountSigner

Next, inside any component which is wrapped by the above DynamicContextProvider, use the `useDynamicContext` hook to fetch your provider, and create a `SmartAccountSigner`:

<<< @/snippets/dynamic.ts

### Use it with Light Account

Let's see it in action with `aa-alchemy` and `LightSmartContractAccount` from `aa-accounts`:
::: code-group

```ts [example.ts]
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import {
  LightSmartContractAccount,
  getDefaultLightAccountFactoryAddress,
} from "@alchemy/aa-accounts";
import { sepolia } from "viem/chains";
import { dynamicSigner } from "./dynamic";

const chain = sepolia;

const provider = new AlchemyProvider({
  apiKey: "ALCHEMY_API_KEY",
  chain,
}).connect(
  (rpcClient) =>
    new LightSmartContractAccount({
      chain,
      owner: dynamicSigner,
      factoryAddress: getDefaultLightAccountFactoryAddress(chain),
      rpcClient,
    })
);
```

<<< @/snippets/dynamic.ts

:::
