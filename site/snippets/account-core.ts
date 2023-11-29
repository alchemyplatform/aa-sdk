/* via `aa-core`*/

import {
  LocalAccountSigner,
  SimpleSmartContractAccount,
  SmartAccountProvider,
  getDefaultSimpleAccountFactoryAddress,
  type SmartAccountSigner,
} from "@alchemy/aa-core";
import { polygonMumbai } from "viem/chains";

// 1. define the EOA owner of the smart account
// this uses a utility method for creating an account signer using mnemonic
// we also have a utility for creating an account signer from a private key
const owner: SmartAccountSigner =
  LocalAccountSigner.mnemonicToAccountSigner(MNEMONIC);

const chain = polygonMumbai;

// 2. initialize the provider and connect it to the account
const provider = new SmartAccountProvider({
  // the demo key below is public and rate-limited, it's better to create a new one
  // you can get started with a free account @ https://www.alchemy.com/
  rpcProvider: "https://polygon-mumbai.g.alchemy.com/v2/demo",
  chain,
}).connect(
  (rpcClient) =>
    new SimpleSmartContractAccount({
      chain,
      factoryAddress: getDefaultSimpleAccountFactoryAddress(chain),
      rpcClient,
      owner,
      // optionally if you already know the account's address
      accountAddress: "0x000...000",
    })
);

// 3. send a UserOperation
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const { hash } = await provider.sendUserOperation({
  target: "0xTargetAddress",
  data: "0xcallData",
  value: 0n, // value: bigint or undefined
});
