import {
  SimpleSmartContractAccount,
  getChain,
  getDefaultSimpleAccountFactoryAddress,
  type Address,
} from "@alchemy/aa-core";
import { Wallet } from "@ethersproject/wallet";
import { Alchemy, Network, type AlchemyProvider } from "alchemy-sdk";
import { sepolia } from "viem/chains";
import { EthersProviderAdapter } from "../src/provider-adapter.js";
import { convertWalletToAccountSigner } from "../src/utils.js";
import { API_KEY, OWNER_MNEMONIC, RPC_URL } from "./constants.js";

const chain = sepolia;

describe("Simple Account Tests", async () => {
  const alchemy = new Alchemy({
    apiKey: API_KEY,
    url: RPC_URL,
    network: Network.ETH_SEPOLIA,
  });
  const alchemyProvider = await alchemy.config.getProvider();
  const owner = Wallet.fromMnemonic(OWNER_MNEMONIC);

  it("should successfully get counterfactual address", async () => {
    const provider = givenConnectedProvider({ alchemyProvider, owner });
    expect(await provider.getAddress()).toMatchInlineSnapshot(
      `"0xb856DBD4fA1A79a46D426f537455e7d3E79ab7c4"`
    );
  });

  it("should execute successfully", async () => {
    const provider = givenConnectedProvider({ alchemyProvider, owner });
    const result = await provider.sendUserOperation({
      target: (await provider.getAddress()) as `0x${string}`,
      data: "0x",
    });
    const txnHash = provider.waitForUserOperationTransaction(
      result.hash as `0x${string}`
    );

    await expect(txnHash).resolves.not.toThrowError();
  }, 50000);

  it("should fail to execute if account address is not deployed and not correct", async () => {
    const accountAddress = "0xc33AbD9621834CA7c6Fc9f9CC3c47b9c17B03f9F";
    const provider = givenConnectedProvider({
      alchemyProvider,
      owner,
      accountAddress,
    });

    const result = provider.sendUserOperation({
      target: (await provider.getAddress()) as `0x${string}`,
      data: "0x",
    });

    await expect(result).rejects.toThrowError();
  }, 20000);
});

const givenConnectedProvider = ({
  alchemyProvider,
  owner,
  accountAddress,
}: {
  alchemyProvider: AlchemyProvider;
  owner: Wallet;
  accountAddress?: Address;
}) =>
  EthersProviderAdapter.fromEthersProvider(alchemyProvider).connectToAccount(
    (rpcClient) =>
      new SimpleSmartContractAccount({
        chain: getChain(alchemyProvider.network.chainId),
        owner: convertWalletToAccountSigner(owner),
        factoryAddress: getDefaultSimpleAccountFactoryAddress(chain),
        rpcClient,
        accountAddress,
      })
  );
