/* via `aa-alchemy` */

import { AlchemyProvider } from "@alchemy/aa-alchemy";
import {
  LocalAccountSigner,
  SimpleSmartContractAccount,
  type SmartAccountSigner,
} from "@alchemy/aa-core";
import { polygonMumbai } from "viem/chains";

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
provider.withAlchemyGasManager({
  policyId: PAYMASTER_POLICY_ID,
  entryPoint: ENTRYPOINT_ADDRESS,
});

// 3. send a UserOperation
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { hash } = await provider.sendUserOperation({
  target: "0xTargetAddress",
  data: "0xcallData",
  value: 0n, // value: bigint or undefined
});
