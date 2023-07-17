import { getChain, SimpleSmartContractAccount } from "@alchemy/aa-core";
import { Alchemy, Network } from "alchemy-sdk";
import { EthersProviderAdapter } from "../../src/provider-adapter.js";
import { MockSigner } from "./mocks/mocks.js";

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
      "0xd16f93b584fbfdc03a5ee85914a1f29aa35c44fea5144c387ee1040a3c1678252bf323b7e9c3e9b4dfd91cca841fc522f4d3160a1e803f2bf14eb5fa037aae4a1b"
    );
  });
});
