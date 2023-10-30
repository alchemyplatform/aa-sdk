import type { Address } from "viem";
import { polygonMumbai, type Chain } from "viem/chains";
import { describe, it } from "vitest";
import { getDefaultSimpleAccountFactoryAddress } from "../../index.js";
import { SmartAccountProvider } from "../../provider/base.js";
import { LocalAccountSigner } from "../../signer/local-account.js";
import { type SmartAccountSigner } from "../../signer/types.js";
import type { BatchUserOperationCallData } from "../../types.js";
import { SimpleSmartContractAccount } from "../simple.js";

describe("Account Simple Tests", () => {
  const dummyMnemonic =
    "test test test test test test test test test test test test";
  const owner: SmartAccountSigner =
    LocalAccountSigner.mnemonicToAccountSigner(dummyMnemonic);

  const chain = polygonMumbai;

  it("should correctly sign the message", async () => {
    const signer = givenConnectedProvider({ owner, chain });
    expect(
      await signer.signMessage(
        "0xa70d0af2ebb03a44dcd0714a8724f622e3ab876d0aa312f0ee04823285d6fb1b"
      )
    ).toBe(
      "0x33b1b0d34ba3252cd8abac8147dc08a6e14a6319462456a34468dd5713e38dda3a43988460011af94b30fa3efefcf9d0da7d7522e06b7bd8bff3b65be4aee5b31c"
    );
  });

  it("should correctly encode batch transaction data", async () => {
    const signer = givenConnectedProvider({ owner, chain });
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

  it("should correctly do base runtime validation when entrypoint are invalid", () => {
    expect(
      () =>
        new SimpleSmartContractAccount({
          entryPointAddress: 1 as unknown as Address,
          chain,
          owner,
          factoryAddress: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
          rpcClient: "ALCHEMY_RPC_URL",
        })
    ).toThrowErrorMatchingInlineSnapshot(`
      "[
        {
          \\"code\\": \\"invalid_type\\",
          \\"expected\\": \\"string\\",
          \\"received\\": \\"number\\",
          \\"path\\": [
            \\"entryPointAddress\\"
          ],
          \\"message\\": \\"Expected string, received number\\"
        }
      ]"
    `);
  });

  it("should correctly do base runtime validation when multiple inputs are invalid", () => {
    expect(
      () =>
        new SimpleSmartContractAccount({
          entryPointAddress: 1 as unknown as Address,
          chain: "0x1" as unknown as Chain,
          owner,
          factoryAddress: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
          rpcClient: "ALCHEMY_RPC_URL",
        })
    ).toThrowErrorMatchingInlineSnapshot(`
      "[
        {
          \\"code\\": \\"invalid_type\\",
          \\"expected\\": \\"string\\",
          \\"received\\": \\"number\\",
          \\"path\\": [
            \\"entryPointAddress\\"
          ],
          \\"message\\": \\"Expected string, received number\\"
        },
        {
          \\"code\\": \\"custom\\",
          \\"message\\": \\"Invalid input\\",
          \\"path\\": [
            \\"chain\\"
          ]
        }
      ]"
    `);
  });
});

const givenConnectedProvider = ({
  owner,
  chain,
}: {
  owner: SmartAccountSigner;
  chain: Chain;
}) =>
  new SmartAccountProvider({
    rpcProvider: `${chain.rpcUrls.alchemy.http[0]}/${"test"}`,
    chain,
  }).connect((provider) => {
    const account = new SimpleSmartContractAccount({
      chain,
      owner,
      factoryAddress: getDefaultSimpleAccountFactoryAddress(chain),
      rpcClient: provider,
    });

    account.getAddress = vi.fn(
      async () => "0xb856DBD4fA1A79a46D426f537455e7d3E79ab7c4"
    );

    return account;
  });
