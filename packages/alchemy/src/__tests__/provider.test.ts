import {
  SimpleSmartContractAccount,
  type BatchUserOperationCallData,
  type SimpleSmartAccountOwner,
} from "@alchemy/aa-core";
import { toHex } from "viem";
import { mnemonicToAccount } from "viem/accounts";
import { polygonMumbai } from "viem/chains";
import { AlchemyProvider } from "../provider.js";

describe("Alchemy Provider Tests", () => {
  const dummyMnemonic =
    "test test test test test test test test test test test test";
  const ownerAccount = mnemonicToAccount(dummyMnemonic);
  const owner: SimpleSmartAccountOwner = {
    signMessage: async (msg) =>
      ownerAccount.signMessage({
        message: { raw: toHex(msg) },
      }),
    getAddress: async () => ownerAccount.address,
  };
  const chain = polygonMumbai;
  const signer = new AlchemyProvider({
    apiKey: "test",
    chain,
    entryPointAddress: "0xENTRYPOINT_ADDRESS",
  }).connect((provider) => {
    const account = new SimpleSmartContractAccount({
      entryPointAddress: "0xENTRYPOINT_ADDRESS",
      chain,
      owner,
      factoryAddress: "0xSIMPLE_ACCOUNT_FACTORY_ADDRESS",
      rpcClient: provider,
    });

    account.getAddress = vi.fn(
      async () => "0xb856DBD4fA1A79a46D426f537455e7d3E79ab7c4"
    );

    return account;
  });

  it("should correctly sign the message", async () => {
    expect(
      // TODO: expose sign message on the provider too
      await signer.account.signMessage(
        "0xa70d0af2ebb03a44dcd0714a8724f622e3ab876d0aa312f0ee04823285d6fb1b"
      )
    ).toBe(
      "0x33b1b0d34ba3252cd8abac8147dc08a6e14a6319462456a34468dd5713e38dda3a43988460011af94b30fa3efefcf9d0da7d7522e06b7bd8bff3b65be4aee5b31c"
    );
  });

  it("should correctly encode batch transaction data", async () => {
    const account = signer.account;
    const data = [
      {
        target: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
        data: "0xdeadbeef",
      },
      {
        target: "0x8ba1f109551bd432803012645ac136ddd64dba72",
        data: "0xcafebabe",
      },
    ] satisfies BatchUserOperationCallData;

    expect(await account.encodeBatchExecute(data)).toMatchInlineSnapshot(
      '"0x18dfb3c7000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000002000000000000000000000000deadbeefdeadbeefdeadbeefdeadbeefdeadbeef0000000000000000000000008ba1f109551bd432803012645ac136ddd64dba720000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000004deadbeef000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004cafebabe00000000000000000000000000000000000000000000000000000000"'
    );
  });
});
