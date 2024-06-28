import {
  createPublicClient,
  custom,
  http,
  type Address,
  type Chain,
} from "viem";
import { sepolia } from "viem/chains";
import { describe, it } from "vitest";
import { createBundlerClientFromExisting } from "../../client/bundlerClient.js";
import { createSmartAccountClient } from "../../client/smartAccountClient.js";
import { LocalAccountSigner } from "../../signer/local-account.js";
import { type SmartAccountSigner } from "../../signer/types.js";
import type { BatchUserOperationCallData } from "../../types.js";
import { getDefaultSimpleAccountFactoryAddress } from "../../utils/index.js";
import { createSimpleSmartAccount } from "../simple.js";

describe("Account Simple Tests", async () => {
  const dummyMnemonic =
    "test test test test test test test test test test test test";
  const signer: SmartAccountSigner =
    LocalAccountSigner.mnemonicToAccountSigner(dummyMnemonic);

  const chain = sepolia;
  const publicClient = createBundlerClientFromExisting(
    createPublicClient({
      chain,
      transport: custom({
        request: async ({ method }) => {
          if (method === "eth_getCode") {
            return "0x" as Address;
          }
          return;
        },
      }),
    })
  );

  it("should correctly sign the message", async () => {
    const provider = await givenConnectedProvider({ signer, chain });
    expect(
      await provider.account.signMessage({
        message: {
          raw: "0xa70d0af2ebb03a44dcd0714a8724f622e3ab876d0aa312f0ee04823285d6fb1b",
        },
      })
    ).toBe(
      "0x33b1b0d34ba3252cd8abac8147dc08a6e14a6319462456a34468dd5713e38dda3a43988460011af94b30fa3efefcf9d0da7d7522e06b7bd8bff3b65be4aee5b31c"
    );
  });

  it("should correctly encode batch transaction data", async () => {
    const provider = await givenConnectedProvider({ signer, chain });
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

    expect(
      await provider.account.encodeBatchExecute(data)
    ).toMatchInlineSnapshot(
      '"0x18dfb3c7000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000002000000000000000000000000deadbeefdeadbeefdeadbeefdeadbeefdeadbeef0000000000000000000000008ba1f109551bd432803012645ac136ddd64dba720000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000004deadbeef000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004cafebabe00000000000000000000000000000000000000000000000000000000"'
    );
  });

  it("should correctly use the account init code override", async () => {
    const account = await createSimpleSmartAccount({
      chain: sepolia,
      signer,
      factoryAddress: getDefaultSimpleAccountFactoryAddress(sepolia),
      transport: custom(publicClient),
      // override the account address here so we don't have to resolve the address from the entry point
      accountAddress: "0x1234567890123456789012345678901234567890",
      initCode: "0xdeadbeef",
    });

    vi.spyOn(publicClient, "getBytecode").mockImplementation(() => {
      return Promise.resolve("0x" as Address);
    });

    const initCode = await account.getInitCode();
    expect(initCode).toMatchInlineSnapshot('"0xdeadbeef"');
  });

  const givenConnectedProvider = async ({
    signer,
    chain,
  }: {
    signer: SmartAccountSigner;
    chain: Chain;
  }) =>
    createSmartAccountClient({
      transport: http(`https://test.com`),
      chain: chain,
      account: await createSimpleSmartAccount({
        chain,
        signer,
        accountAddress: "0x1234567890123456789012345678901234567890",
        factoryAddress: getDefaultSimpleAccountFactoryAddress(chain),
        transport: http(`https://test.com`),
      }),
    });
});
