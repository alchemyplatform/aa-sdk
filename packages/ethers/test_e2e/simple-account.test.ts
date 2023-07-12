import { getChain, SimpleSmartContractAccount } from "@alchemy/aa-core";
import { Wallet } from "@ethersproject/wallet";
import { Alchemy, Network } from "alchemy-sdk";
import { EthersProviderAdapter } from "../src/provider-adapter.js";
import { convertWalletToAccountSigner } from "../src/utils.js";
import { API_KEY, OWNER_MNEMONIC } from "./constants.js";

const ENTRYPOINT_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
const SIMPLE_ACCOUNT_FACTORY_ADDRESS =
  "0x9406Cc6185a346906296840746125a0E44976454";

describe("Simple Account Tests", async () => {
  const alchemy = new Alchemy({
    apiKey: API_KEY,
    network: Network.MATIC_MUMBAI,
  });
  const alchemyProvider = await alchemy.config.getProvider();
  const owner = Wallet.fromMnemonic(OWNER_MNEMONIC);
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

  it("should succesfully get counterfactual address", async () => {
    expect(await signer.getAddress()).toMatchInlineSnapshot(
      `"0xb856DBD4fA1A79a46D426f537455e7d3E79ab7c4"`
    );
  });

  it("should execute successfully", async () => {
    const result = signer.sendUserOperation({
      target: (await signer.getAddress()) as `0x${string}`,
      data: "0x",
    });

    await expect(result).resolves.not.toThrowError();
  });

  it("should correctly sign the message", async () => {
    expect(
      await signer.signMessage(
        "0xa70d0af2ebb03a44dcd0714a8724f622e3ab876d0aa312f0ee04823285d6fb1b"
      )
    ).toBe(
      "0xd16f93b584fbfdc03a5ee85914a1f29aa35c44fea5144c387ee1040a3c1678252bf323b7e9c3e9b4dfd91cca841fc522f4d3160a1e803f2bf14eb5fa037aae4a1b"
    );
  });

  it("should fail to execute if account address is not deployed and not correct", async () => {
    const accountAddress = "0xc33AbD9621834CA7c6Fc9f9CC3c47b9c17B03f9F";
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
          accountAddress,
        })
    );

    const result = signer.sendUserOperation({
      target: (await signer.getAddress()) as `0x${string}`,
      data: "0x",
    });

    await expect(result).rejects.toThrowError();
  });
});
