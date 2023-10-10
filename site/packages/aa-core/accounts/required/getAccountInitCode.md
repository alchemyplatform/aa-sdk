---
outline: deep
head:
  - - meta
    - property: og:title
      content: getAccountInitCode
  - - meta
    - name: description
      content: Overview of the getAccountInitCode abstract method on BaseSmartContractAccount
  - - meta
    - property: og:description
      content: Overview of the getAccountInitCode abstract method on BaseSmartContractAccount
---

# getAccountInitCode

This method should return the init code that will be used to create an account if one does not exist.

This is [expected](https://github.com/eth-infinitism/account-abstraction/blob/v0.6.0/contracts/core/SenderCreator.sol#L15) to be the concatenation of the account's factory address and the abi encoded function data of the account factory's `createAccount` method.

**Reference:**

- [EIP-4337: First-time account creation](https://eips.ethereum.org/EIPS/eip-4337#first-time-account-creation)
- [EntryPoint spec](https://github.com/eth-infinitism/account-abstraction/blob/v0.6.0/contracts/core/SenderCreator.sol#L15)

## Example Implementation

::: code-group

```ts [example.ts]
// [!code focus:99]
async getAccountInitCode(): Promise<`0x${string}`> {
  return concatHex([
    this.factoryAddress,
    encodeFunctionData({
      abi: SimpleAccountFactoryAbi,
      functionName: "createAccount",
      args: [await this.owner.getAddress(), this.index],
    }),
  ]);
}
```

:::

## Usage

::: code-group

```ts [example.ts]
import { provider } from "./provider";
// [!code focus:99]
const initCode = await provider.getAccountInitCode();
const factoryAddress = `0x${initCode.substring(2, 42)}` as Address;
const factoryCalldata = `0x${initCode.substring(42)}` as Hex;
```

<<< @/snippets/provider.ts

:::

## Returns

### `Promise<Hex>`

The promise containing the init code for the account
