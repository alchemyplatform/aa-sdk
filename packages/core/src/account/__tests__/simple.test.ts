import { polygonMumbai } from "viem/chains";
import { describe, it } from "vitest";
import { SmartAccountProvider } from "../../provider/base.js";
import { LocalAccountSigner } from "../../signer/local-account.js";
import type { BatchUserOperationCallData } from "../../types.js";
import {
  SimpleSmartContractAccount,
  type SimpleSmartAccountOwner,
} from "../simple.js";

describe("Account Simple Tests", () => {
  const dummyMnemonic =
    "test test test test test test test test test test test test";
  const owner: SimpleSmartAccountOwner =
    LocalAccountSigner.mnemonicToAccountSigner(dummyMnemonic);
  const chain = polygonMumbai;
  const signer = new SmartAccountProvider(
    `${chain.rpcUrls.alchemy.http[0]}/${"test"}`,
    "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    chain
  ).connect((provider) => {
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
      await signer.signMessage(
        "0xa70d0af2ebb03a44dcd0714a8724f622e3ab876d0aa312f0ee04823285d6fb1b"
      )
    ).toBe(
      "0x33b1b0d34ba3252cd8abac8147dc08a6e14a6319462456a34468dd5713e38dda3a43988460011af94b30fa3efefcf9d0da7d7522e06b7bd8bff3b65be4aee5b31c"
    );
  });

  it("should correctly sign typed data", async () => {
    expect(
      await signer.signTypedData({
        types: {
          Test: [{ name: "field", type: "string" }],
        },
        primaryType: "Test",
        message: {
          field: "hello",
        },
      })
    ).toMatchInlineSnapshot('"0x897523d411465887b14aa502a31b56f52c755f3a046586b57f866821123cbb27601819defb38c5b38fce53fbbd65b5a3e05fedc476167bd52c397af3db9dcd8c1b"');
  });

  it("should correctly encode batch transaction data", async () => {
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

    expect(await signer.account.encodeBatchExecute(data)).toMatchInlineSnapshot(
      '"0x18dfb3c7000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000002000000000000000000000000deadbeefdeadbeefdeadbeefdeadbeefdeadbeef0000000000000000000000008ba1f109551bd432803012645ac136ddd64dba720000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000004deadbeef000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004cafebabe00000000000000000000000000000000000000000000000000000000"'
    );
  });
});
