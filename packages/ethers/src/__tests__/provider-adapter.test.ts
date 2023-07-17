import { getChain, SimpleSmartContractAccount } from "@alchemy/aa-core";
import { Alchemy, Network } from "alchemy-sdk";
import { EthersProviderAdapter } from "../../src/provider-adapter.js";
import { MockSigner } from "./mocks/mock-signer.js";

describe("Simple Account Tests", async () => {
  const alchemy = new Alchemy({
    apiKey: "test",
    network: Network.MATIC_MUMBAI,
  });
  const alchemyProvider = await alchemy.config.getProvider();
  const signer = EthersProviderAdapter.fromEthersProvider(
    alchemyProvider,
    "0xENTRYPOINT_ADDRESS"
  ).connectToAccount(
    (rpcClient) =>
      new SimpleSmartContractAccount({
        entryPointAddress: "0xENTRYPOINT_ADDRESS",
        chain: getChain(alchemyProvider.network.chainId),
        owner: new MockSigner(),
        factoryAddress: "0xSIMPLE_ACCOUNT_FACTORY_ADDRESS",
        rpcClient,
      })
  );

  it("should correctly sign the message", async () => {
    expect(
      await signer.signMessage(
        "0xa70d0af2ebb03a44dcd0714a8724f622e3ab876d0aa312f0ee04823285d6fb1b"
      )
    ).toBe(
      "0x4d61c5c27fb64b207cbf3bcf60d78e725659cff5f93db9a1316162117dff72aa631761619d93d4d97dfb761ba00b61f9274c6a4a76e494df644d968dd84ddcdb1c"
    );
  });
});
