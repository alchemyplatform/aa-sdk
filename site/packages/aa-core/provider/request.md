---
outline: deep
head:
  - - meta
    - property: og:title
      content: ISmartAccountProvider • request
  - - meta
    - name: description
      content: Overview of the request method on ISmartAccountProvider
  - - meta
    - property: og:description
      content: Overview of the request method on ISmartAccountProvider
---

# request

EIP-1193 compliant request method. Executes various Ethereum-related JSON-RPC methods based on the provided 'method' (the Ethereum JSON-RPC method to be executed) and 'params' (optional array of parameters for the rpc method).

Currently, `eth_sendTransaction` `eth_sign` `personal_sign` `eth_signTypedData_v4` `eth_chainId` have been tested, but other rpc methods have not been tested yet.
Other than the tested methods above, the function delegates the request to the underlying RPC client.

## Usage

::: code-group

```ts [example.ts]
import { provider } from "./provider";
// [!code focus:99]
const result = await provider.request({
  method: "eth_sendTransaction",
  params: [tx],
});

const result = await provider.request({
  method: "eth_sign",
  params: [address, data],
});

const result = await provider.request({
  method: "eth_signTypedData_v4",
  params: [address, dataParams],
});
```

<<< @/snippets/provider.ts

:::

## Returns

### `Promise<any>`

A Promise that resolves to the result of the JSON-RPC call

## Parameters

### `args: { method: string; params?: any[] }`

object containing the method and optional params to execute.
`method` - The Ethereum JSON-RPC method to be executed
`params` - Optional array of parameters specific to the chosen method
