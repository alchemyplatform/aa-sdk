/* via `aa-ethers`*/
import {
  getChain,
  getDefaultEntryPointContract,
  getDefaultSimpleAccountFactory,
  SimpleSmartContractAccount,
} from "@alchemy/aa-core";
import {
  convertWalletToAccountSigner,
  EthersProviderAdapter,
} from "@alchemy/aa-ethers";
import { Wallet } from "@ethersproject/wallet";
import { Alchemy, Network } from "alchemy-sdk";
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
  alchemyProvider
).connectToAccount(
  (rpcClient) =>
    new SimpleSmartContractAccount({
      entryPointAddress: getDefaultEntryPointContract(
        getChain(alchemyProvider.network.chainId)
      ),
      chain: getChain(alchemyProvider.network.chainId),
      owner: convertWalletToAccountSigner(owner),
      factoryAddress: getDefaultSimpleAccountFactory(
        getChain(alchemyProvider.network.chainId)
      ),
      rpcClient,
    })
);
// 3. send a user op
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { hash } = await signer.sendUserOperation({
  target: "0xTargetAddress",
  data: "0xcallData",
  value: 0n, // value: bigint or undefined
});
