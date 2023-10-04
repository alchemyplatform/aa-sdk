# Account Abstraction SDK (aa-sdk)

⚠️ This repo is actively being developed and certain features might not be fully implemented yet or are subject to change ⚠️

Alchemy's Account Abstraction Kit is an SDK that enables easy interactions with [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337) compliant smart accounts. It supports bringing your own Account Contracts or using any of the currently available accounts. The SDK is built on top of `viem` to enable a lighter-weight bundle and is published with ESM default exports though also supports CJS.

## Getting Started

via `yarn`:

```bash
yarn add @alchemy/aa-core viem
```

via `npm`:

```bash
npm i -s @alchemy/aa-core viem
```

If you are using Alchemy APIs for Account Abstraction, then you can also add the `@alchemy/aa-alchemy` package:

via `yarn`:

```bash
yarn add @alchemy/aa-alchemy
```

via `npm`:

```bash
npm i -s @alchemy/aa-alchemy
```

If you are using `ethers` and want to use an `ethers` compatible `Provider` and `Signer` you can also add the the `@alchemy/aa-ethers` library (the above packages are required still).

via `yarn`:

```bash
yarn add @alchemy/aa-ethers
```

via `npm`:

```bash
npm i -s @alchemy/aa-ethers
```

## Example Usage to Interact with [Simple Accounts](https://github.com/eth-infinitism/account-abstraction/blob/develop/contracts/samples/SimpleAccount.sol)

**Note 🗒️:** We've also included an [E2E example here](https://github.com/alchemyplatform/aa-sdk/tree/main/examples/alchemy-daapp). This example DApp creates a simple account wallet and mints an NFT in one flow.

### via `aa-core`

```ts
import {
  SimpleSmartContractAccount,
  SmartAccountProvider,
  type SmartAccountSigner,
  LocalAccountSigner,
} from "@alchemy/aa-core";
import { mnemonicToAccount } from "viem/accounts";
import { polygonMumbai } from "viem/chains";
import { toHex } from "viem";

const SIMPLE_ACCOUNT_FACTORY_ADDRESS =
  "0x9406Cc6185a346906296840746125a0E44976454";

// 1. define the EOA owner of the Smart Account
// this uses a utility method for creating an account signer using mnemonic
// we also have a utility for creating an account signer from a private key
const owner: SmartAccountSigner =
  LocalAccountSigner.mnemonicToAccountSigner(MNEMONIC);

// 2. initialize the provider and connect it to the account
const provider = new SmartAccountProvider({
  // the demo key below is public and rate-limited, it's better to create a new one
  // you can get started with a free account @ https://www.alchemy.com/
  rpcProvider: "https://polygon-mumbai.g.alchemy.com/v2/demo",
  entryPointAddress: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
  chain: polygonMumbai,
}).connect(
  (rpcClient) =>
    new SimpleSmartContractAccount({
      entryPointAddress: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
      chain: polygonMumbai,
      factoryAddress: SIMPLE_ACCOUNT_FACTORY_ADDRESS,
      rpcClient,
      owner,
      // optionally if you already know the account's address
      accountAddress: "0x000...000",
    })
);

// 3. send a UserOperation
const { hash } = await provider.sendUserOperation({
  target: "0xTargetAddress",
  data: "0xcallData",
  value: 0n, // value: bigint or undefined
});
```

### via `aa-alchemy`

```ts
import {
  SimpleSmartContractAccount,
  type SmartAccountSigner,
  LocalAccountSigner,
} from "@alchemy/aa-core";
import { toHex } from "viem";
import { mnemonicToAccount } from "viem/accounts";
import { polygonMumbai } from "viem/chains";
import { AlchemyProvider } from "@alchemy/aa-alchemy";

const SIMPLE_ACCOUNT_FACTORY_ADDRESS =
  "0x9406Cc6185a346906296840746125a0E44976454";

// 1. define the EOA owner of the Smart Account
// this uses a utility method for creating an account signer using mnemonic
// we also have a utility for creating an account signer from a private key
const owner: SmartAccountSigner =
  LocalAccountSigner.mnemonicToAccountSigner(MNEMONIC);

// 2. initialize the provider and connect it to the account
let provider = new AlchemyProvider({
  apiKey: API_KEY,
  chain,
  entryPointAddress: ENTRYPOINT_ADDRESS,
}).connect(
  (rpcClient) =>
    new SimpleSmartContractAccount({
      entryPointAddress: ENTRYPOINT_ADDRESS,
      chain: polygonMumbai, // ether a viem Chain or chainId that supports account abstraction at Alchemy
      owner,
      factoryAddress: SIMPLE_ACCOUNT_FACTORY_ADDRESS,
      rpcClient,
    })
);

// [OPTIONAL] Use Alchemy Gas Manager
provider = provider.withAlchemyGasManager({
  policyId: PAYMASTER_POLICY_ID,
  entryPoint: ENTRYPOINT_ADDRESS,
});

// 3. send a UserOperation
const { hash } = await provider.sendUserOperation({
  target: "0xTargetAddress",
  data: "0xcallData",
  value: 0n, // value: bigint or undefined
});
```

### via `aa-ethers`

```ts
import {
  alchemyPaymasterAndDataMiddleware,
  getChain,
  SimpleSmartContractAccount,
} from "@alchemy/aa-core";
import { Alchemy, Network } from "alchemy-sdk";
import { Wallet } from "@ethersproject/wallet";
import {
  EthersProviderAdapter,
  convertWalletToAccountSigner,
} from "@alchemy/aa-ethers";

const SIMPLE_ACCOUNT_FACTORY_ADDRESS =
  "0x9406Cc6185a346906296840746125a0E44976454";

// 1. connect to an RPC Provider and a Wallet
const alchemy = new Alchemy({
  apiKey: API_KEY,
  network: Network.MATIC_MUMBAI,
});
const alchemyProvider = await alchemy.config.getProvider();
const owner = Wallet.fromMnemonic(MNEMONIC);

// 2. Create the SimpleAccount signer
// signer is an ethers.js Signer
const signer = EthersProviderAdapter.fromEthersProvider(
  alchemyProvider,
  ENTRYPOINT_ADDRESS
).connectToAccount(
  (rpcClient) =>
    new SimpleSmartContractAccount({
      entryPointAddress: ENTRYPOINT_ADDRESS,
      chain: getChain(alchemyProvider.network.chainId),
      owner: convertWalletToAccountSigner(owner),
      factoryAddress: SIMPLE_ACCOUNT_FACTORY_ADDRESS,
      rpcClient,
    })
);

// 3. send a user op
const { hash } = await signer.sendUserOperation({
  target: "0xTargetAddress",
  data: "0xcallData",
  value: 0n, // value: bigint or undefined
});
```

## Components

### Core Components

The primary interfaces are the `SmartAccountProvider` and `BaseSmartContractAccount`.

The `SmartAccountProvider` is an [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) compliant Provider that wraps JSON RPC methods and some Wallet Methods (signing, sendTransaction, etc). It also provides two utility methods for sending UserOperations:

1. `sendUserOperation` -- this takes in `target`, `callData`, and an optional `value` which then constructs a UserOperation (UO), sends it, and returns the `hash` of the UO. It handles estimating gas, fetching fee data, (optionally) requesting paymasterAndData, and lastly signing. This is done via a middleware stack that runs in a specific order. The middleware order is `getDummyPaymasterData` => `estimateGas` => `getFeeData` => `getPaymasterAndData`. The paymaster fields are set to `0x` by default. They can be changed using `provider.withPaymasterMiddleware`.
2. `sendTransaction` -- this takes in a traditional Transaction Request object which then gets converted into a UO. Note that `to` field of transaction is required, and among other fields of transaction, only `data`, `value`, `maxFeePerGas`, `maxPriorityFeePerGas` fields are considered if given. Support for other fields is coming soon.

If you want to add support for your own `SmartAccounts` then you will need to provide an implementation of `BaseSmartContractAccount`. You can see an example of this in [SimpleSmartContractAccount](packages/core/src/account/simple.ts). You will need to implement 4 methods:

1. `getDummySignature` -- this method should return a signature that will not `revert` during validation. It does not have to pass validation, just not cause the contract to revert. This is required for gas estimation so that the gas estimate are accurate.
2. `encodeExecute` -- this method should return the abi encoded function data for a call to your contract's `execute` method
3. `signMessage` -- this should return an [EIP-191](https://eips.ethereum.org/EIPS/eip-191) compliant message and is used to sign UO Hashes
4. `getAccountInitCode` -- this should return the init code that will be used to create an account if one does not exist. Usually this is the concatenation of the account's factory address and the abi encoded function data of the account factory's `createAccount` method.

### Paymaster Middleware

You can use `provider.withPaymasterMiddleware` to add middleware to the stack which will set the `paymasterAndData` field during `sendUserOperation` calls. The `withPaymasterMiddleware` method has two overrides. One of the overrides takes a `dummyPaymasterData` generator function. This `dummyPaymasterData` is needed to estimate gas correctly when using a paymaster and is specific to the paymaster you're using. The second override is the actually `paymasterAndData` generator function. This function is called after gas estimation and fee estimation and is used to set the `paymasterAndData` field. The default `dummyPaymasterData` generator function returns `0x` for both the `paymasterAndData` fields. The default `paymasterAndData` generator function returns `0x` for both the `paymasterAndData` fields.

Both of the override methods can return new gas estimates. This allows for paymaster RPC urls that handle gas estimation for you. It's important to note that if you're using an ERC-20 paymaster and your RPC endpoint does not return estimates, you should add an additional 75k gas to the gas estimate for `verificationGasLimit`.

### Alchemy Gas Manager Middleware

Alchemy has two separate RPC methods for interacting with our Gas Manager services. The first is `alchemy_requestPaymasterAndData` and the second is `alchemy_requestGasAndPaymasterAndData`.
The former is useful if you want to do your own gas estimation + fee estimation (or you're happy using the default middlewares for gas and fee estimation), but want to use the Alchemy Gas Manager service.
The latter is will handle gas + fee estimation and return `paymasterAndData` in a single request.

We provide two utility methods in `@alchemy/aa-alchemy` for interacting with these RPC methods:

1. `alchemyPaymasterAndDataMiddleware` which is used in conjunction with `withPaymasterMiddleware` to add the `alchemy_requestPaymasterAndData` RPC method to the middleware stack.
2. `withAlchemyGasManager` which wraps a connected `SmartAccountProvider` with the middleware overrides to use `alchemy_requestGasAndPaymasterAndData` RPC method.

## Contributing

1. clone the repo
2. run `yarn`
3. Make changes to packages

To run tests:

TODO: currently tests require a specific mnemonic to pass and they run against the alchemy bundler which is in private beta.
