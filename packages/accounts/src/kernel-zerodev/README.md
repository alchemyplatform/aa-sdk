# Zerodev Kernel Account API

This module provides a Signer + Provider implementation of Zerodev's Kernel V2 on top of `@alchemy/aa-core`

[What is Kernel V2?](https://docs.zerodev.app/blog/kernel-v2-and-the-lessons-we-learned)
[Documentation](https://docs.zerodev.app/use-wallets/overview)

## Example Usage to Interact with [Kernel Accounts](https://github.com/zerodevapp/kernel/blob/main/src/Kernel.sol)

### via `aa-accounts`

```ts
import {
  KernelSmartContractAccount,
  KernelAccountProvider,
  type KernelSmartAccountParams,
  KernelBaseValidator,
  type ValidatorMode,
} from "@alchemy/aa-accounts";
import { mnemonicToAccount } from "viem/accounts";
import { LocalAccountSigner } from "@alchemy/aa-core";
import { polygonMumbai } from "viem/chains";
import { toHex } from "viem";

const KERNEL_ACCOUNT_FACTORY_ADDRESS =
  "0x5D006d3880645ec6e254E18C1F879DAC9Dd71A39";

// 1. define the EOA owner of the Smart Account
// This is just one exapmle of how to interact with EOAs, feel free to use any other interface
const owner = LocalAccountSigner.privateKeyToAccountSigner(PRIVATE_KEY);

const validator: KernelBaseValidator = new KernelBaseValidator({
  validatorAddress: "0x180D6465F921C7E0DEA0040107D342c87455fFF5",
  mode: ValidatorMode.sudo,
  owner,
});

// 2. initialize the provider and connect it to the account
const provider = new KernelAccountProvider(
  // the demo key below is public and rate-limited, it's better to create a new one
  // you can get started with a free account @ https://www.alchemy.com/
  "https://polygon-mumbai.g.alchemy.com/v2/demo", // rpcUrl
  "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789", // entryPointAddress
  polygonMumbai // chain
).connect(
  (rpcClient) =>
    new KernelSmartContractAccount({
      owner,
      index: 0n,
      entryPointAddress: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
      chain: polygonMumbai,
      factoryAddress: KERNEL_ACCOUNT_FACTORY_ADDRESS,
      rpcClient,
      // optionally if you already know the account's address
      accountAddress: "0x000...000",
      defaultValidator: validator,
      validator,
    })
);

// 3. send a UserOperation
const { hash } = provider.sendUserOperation({
  target: "0xTargetAddress",
  data: "0xcallData",
  value: 0n, // value: bigint or undefined
});
```

## Components

### Core Components

The primary interfaces are the `KernelAccountProvider`, `KernelSmartContractAccount` and `KernelBaseValidator`

The `KernelAccountProvider` is an [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) compliant Provider built on top of Alchemy's `SmartAccountProvider`

1. `sendUserOperation` -- this takes in `target`, `callData`, and an optional `value` which then constructs a UserOperation (UO), sends it, and returns the `hash` of the UO. It handles estimating gas, fetching fee data, (optionally) requesting paymasterAndData, and lastly signing. This is done via a middleware stack that runs in a specific order. The middleware order is `getDummyPaymasterData` => `estimateGas` => `getFeeData` => `getPaymasterAndData`. The paymaster fields are set to `0x` by default. They can be changed using `provider.withPaymasterMiddleware`.
2. `sendTransaction` -- this takes in a traditional Transaction Request object which then gets converted into a UO. This takes in a traditional Transaction Request object which then gets converted into a UO. Note that `to` field of transaction is required, and among other fields of transaction, only `data`, `value`, `maxFeePerGas`, `maxPriorityFeePerGas` fields are considered if given. Support for other fields is coming soon.

`KernelSmartContractAccount` is Kernel's implementation of `BaseSmartContractAccount`. 6 main methods are implemented

1. `getDummySignature` -- this method should return a signature that will not `revert` during validation. It does not have to pass validation, just not cause the contract to revert. This is required for gas estimation so that the gas estimate are accurate.
2. `encodeExecute` -- this method should return the abi encoded function data for a call to your contract's `execute` method
3. `encodeExecuteDelegate` -- this method should return the abi encoded function data for a `delegate` call to your contract's `execute` method
4. `signMessage` -- this is used to sign UO Hashes
5. `signWithEip6492` -- this should return an [ERC-191](https://eips.ethereum.org/EIPS/eip-191) and [ERC-6492](https://eips.ethereum.org/EIPS/eip-6492) compliant message used to personal_sign
6. `getAccountInitCode` -- this should return the init code that will be used to create an account if one does not exist. Usually this is the concatenation of the account's factory address and the abi encoded function data of the account factory's `createAccount` method.

The `KernelBaseValidator` is a plugin that modify how transactions are validated. It allows for extension and implementation of arbitrary validation logic. It implements 3 methods:

1. `getAddress` -- this returns the address of the validator
2. `getOwner` -- this returns the eligible signer's address for the active smart wallet
3. `signMessageWithValidatorParams` -- this method signs the userop hash using signer object and then concats additional params based on validator mode.

## Contributing

1. clone the repo
2. run `yarn`
3. Make changes to packages
