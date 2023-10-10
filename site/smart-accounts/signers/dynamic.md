---
outline: deep
head:
  - - meta
    - property: og:title
      content: Dynamic
  - - meta
    - name: description
      content: Guide to use Dynamic as a signer
  - - meta
    - property: og:description
      content: Guide to use Dynamic as a signer
---

# Dynamic

## Integration

### Install the sdk

By default, the latest version of the Dynamic SDK ships with Viem. If you need to use Ethers, please refer to [this guide](https://docs.dynamic.xyz/quickstart) (make sure to choose v19 in the docs version toggle on the top left).

In this example, we are installing only the Ethereum connectors in order to keep bundle size light. If you need any others, you can [find the references here](https://docs.dynamic.xyz/quickstart#choosing-the-right-packages) (make sure to choose v19 in the docs version toggle on the top left).

::: code-group

```bash [npm]
npm i -s @dynamic-labs/sdk-react-core@alpha @dynamic-labs/ethereum-all
```

```bash [yarn]
yarn add @dynamic-labs/sdk-react-core@alpha @dynamic-labs/ethereum-all
```

:::

### Add Dynamic to your application

In order to use Dynamic, you should wrap your app with `DynamicContextProvider` at the highest possible level i.e.

```jsx
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum-all";
import Home from "./Home";

// Found in your Dynamic dashboard (https://app.dynamic.xyz/dashboard/developer)
const DYNAMIC_ENVIRONMENT_ID = "XXXXX";

const App = () => {
  return (
    <div className="app">
      <DynamicContextProvider
        settings={{
          environmentId: "",
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

### Use it with LightAccount

Let's see it in action with `aa-alchemy` and `LightSmartContractAccount` from `aa-accounts`:
::: code-group

```ts [example.ts]
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import {
  LightSmartContractAccount,
  getDefaultLightAccountFactory,
} from "@alchemy/aa-accounts";
import { sepolia } from "viem/chains";
import { dynamicSigner } from "./dynamic";

const chain = sepolia;
const provider = new AlchemyProvider({
  apiKey: "ALCHEMY_API_KEY",
  chain,
  entryPointAddress: "0x...",
}).connect(
  (rpcClient) =>
    new LightSmartContractAccount({
      entryPointAddress: "0x...",
      chain: rpcClient.chain,
      owner: dynamicSigner,
      factoryAddress: getDefaultLightAccountFactory(chain),
      rpcClient,
    })
);
```

<<< @/snippets/dynamic.ts

:::
