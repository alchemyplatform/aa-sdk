/* via `aa-alchemy` */

import { AlchemyProvider } from "@alchemy/aa-alchemy";
import {
  LocalAccountSigner,
  SimpleSmartContractAccount,
  getDefaultEntryPointAddress,
  getDefaultSimpleAccountFactoryAddress,
  type SmartAccountSigner,
} from "@alchemy/aa-core";
import { polygonMumbai } from "viem/chains";

const chain = polygonMumbai;

// 1. define the EOA owner of the smart account
// this uses a utility method for creating an account signer using mnemonic
// we also have a utility for creating an account signer from a private key
const owner: SmartAccountSigner =
  LocalAccountSigner.mnemonicToAccountSigner(MNEMONIC);

// 2. initialize the provider and connect it to the account
let provider = new AlchemyProvider({
  apiKey: API_KEY,
  chain,
}).connect(
  (rpcClient) =>
    new SimpleSmartContractAccount({
      entryPointAddress: getDefaultEntryPointAddress(chain),
      chain, // ether a viem Chain or chainId that supports account abstraction at Alchemy
      owner,
      factoryAddress: getDefaultSimpleAccountFactoryAddress(chain),
      rpcClient,
    })
);

// [OPTIONAL] Use Alchemy Gas Manager
provider.withAlchemyGasManager({
  policyId: PAYMASTER_POLICY_ID,
});

// 3. send a UserOperation
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { hash } = await provider.sendUserOperation({
  target: "0xTargetAddress",
  data: "0xcallData",
  value: 0n, // value: bigint or undefined
});
