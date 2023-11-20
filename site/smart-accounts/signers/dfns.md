---
outline: deep
head:
  - - meta
    - property: og:title
      content: Dfns
  - - meta
    - name: description
      content: Guide for using Dfns as a signer
  - - meta
    - property: og:description
      content: Guide for using Dfns as a signer
---

# Dfns Integration Guide

[Dfns](https://www.dfns.co) is an MPC/TSS Wallet-as-a-Service API/SDK provider.  We have optimized the balance of security and UX by deploying key shares into a decentralized network on the backend while enabling wallet access via biometric open standards on the frontend like Webauthn.  [Ping us](https://www.dfns.co/learn-more) to set up a sandbox environment to get started. 

Dfns seamlessly integrates with Account Abstraction by signing User Operations.  We've created a full example of a gasless transaction via a paymaster [in our SDK](https://github.com/dfns/dfns-sdk-ts/tree/m/examples/viem/alchemy-aa-gasless) adapted from Alchemy's [sponsor gas example](https://accountkit.alchemy.com/guides/sponsoring-gas.html).  Clone the repo to get started and see the comments in the [Readme](https://github.com/dfns/dfns-sdk-ts/tree/m/examples/viem/alchemy-aa-gasless/README.md). 

## Install Dfns SDK

::: code-group

```bash [npm]
npm i @dfns/lib-viem @dfns/sdk @dfns/sdk-keysigner
```

```bash [yarn]
yarn add @dfns/lib-viem @dfns/sdk @dfns/sdk-keysigner
```

:::

### Create a Dfns SmartAccountSigner

Setup the Dfns Web3 Provider and wrap it in an AlchemyProvider.  See the Dfns example [Readme](https://github.com/dfnsext/typescript-sdk/blob/m/examples/viem/alchemy-aa-gasless/README.md) for detail on populating the environment variables.

```ts
import { LightSmartContractAccount, getDefaultLightAccountFactoryAddress } from '@alchemy/aa-accounts'
import { AlchemyProvider } from '@alchemy/aa-alchemy'
import { LocalAccountSigner } from '@alchemy/aa-core'
import { DfnsWallet } from '@dfns/lib-viem'
import { DfnsApiClient } from '@dfns/sdk'
import { AsymmetricKeySigner } from '@dfns/sdk-keysigner'
import dotenv from 'dotenv'
import { encodeFunctionData, parseAbi } from 'viem'
import { toAccount } from 'viem/accounts'
import { sepolia } from 'viem/chains'

dotenv.config()

const initDfnsWallet = (walletId: string) => {
  const signer = new AsymmetricKeySigner({
    privateKey: process.env.DFNS_PRIVATE_KEY!,
    credId: process.env.DFNS_CRED_ID!,
    appOrigin: process.env.DFNS_APP_ORIGIN!,
  })

  const dfnsClient = new DfnsApiClient({
    appId: process.env.DFNS_APP_ID!,
    authToken: process.env.DFNS_AUTH_TOKEN!,
    baseUrl: process.env.DFNS_API_URL!,
    signer,
  })

  return DfnsWallet.init({
    walletId,
    dfnsClient,
    maxRetries: 10,
  })
}

const alchemyProvider = async (): Promise<AlchemyProvider> => {
    const sepoliaWallet = await initDfnsWallet(process.env.SEPOLIA_WALLET_ID!)
    const account = toAccount(sepoliaWallet)
    const eoaSigner = new LocalAccountSigner(account)
  
    return new AlchemyProvider({
      apiKey: process.env.ALCHEMY_SEPOLIA_KEY!,
      chain: sepolia,
    }).connect(
      (rpcClient) =>
        new LightSmartContractAccount({
          chain: sepolia,
          owner: eoaSigner,
          factoryAddress: getDefaultLightAccountFactoryAddress(sepolia),
          rpcClient,
        })
    )
  }
```

### Execute a Gasless Transaction

```ts
const main = async () => {
  const provider = await alchemyProvider()
  const address = await provider.getAddress()
  console.log(`Smart account address: ${address}`)

  // link the provider with the Gas Manager. This ensures user operations
  // sent with this provider get sponsorship from the Gas Manager.
  provider.withAlchemyGasManager({
    policyId: process.env.ALCHEMY_GAS_POLICY_ID!,
  })

  const alchemyToken = '0x6F3c1baeF15F2Ac6eD52ef897f60cac0B10d90C3'

  // send a sponsored user operation to mint some tokens
  const { hash: uoHash } = await provider.sendUserOperation({
    target: alchemyToken,
    data: encodeFunctionData({
      abi: parseAbi(['function mint(address recipient)']),
      functionName: 'mint',
      args: [address],
    }),
  })
  console.log(`User operation hash: ${uoHash}`)

  const txHash = await provider.waitForUserOperationTransaction(uoHash)
  console.log(`Transaction: https://sepolia.etherscan.io/tx/${txHash}`)
}

main()
```
