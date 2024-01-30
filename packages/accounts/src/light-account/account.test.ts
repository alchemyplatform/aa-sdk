import {
  LocalAccountSigner,
  createPublicErc4337FromClient,
  polygonMumbai,
  type BatchUserOperationCallData,
  type SmartAccountSigner,
} from "@alchemy/aa-core";
import { createPublicClient, custom, type Chain } from "viem";
import { createLightAccountClient } from "./createLightAccountClient.js";

const chain = polygonMumbai;

describe("Light Account Tests", () => {
  const dummyMnemonic =
    "test test test test test test test test test test test junk";
  const owner: SmartAccountSigner =
    LocalAccountSigner.mnemonicToAccountSigner(dummyMnemonic);

  it("should correctly sign the message", async () => {
    const { account } = await givenConnectedProvider({ owner, chain });
    const signature = await account.signMessage({
      message:
        "0xa70d0af2ebb03a44dcd0714a8724f622e3ab876d0aa312f0ee04823285d6fb1b",
    });

    expect(signature).toMatchInlineSnapshot(
      '"0x394dcd53572e316d1bf7a5f3be71a4189e1ab1269f57691699f7b18b209e340b63d27ae7b314445fd5a9db5a442278fadd3dc022a9e35a1b5ea20e891c22c8b21c"'
    );
  });

  it("should correctly sign typed data", async () => {
    const provider = await givenConnectedProvider({ owner, chain });
    const signature = await provider.account.signTypedData({
      types: {
        Request: [{ name: "hello", type: "string" }],
      },
      primaryType: "Request",
      message: {
        hello: "world",
      },
    });

    expect(signature).toMatchInlineSnapshot(
      '"0xf1b620ac60e03d01ccc737ad02feffe8631c6f9947083d53ef4f5182eb150d187ec9f7be44bd015ca4e0efb235fdc6f130542ebf31aecb1a736e31ef736a67321b"'
    );
  });

  it("should correctly encode transferOwnership data", async () => {
    const { account } = await givenConnectedProvider({ owner, chain });
    expect(
      account.encodeTransferOwnership(
        "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef"
      )
    ).toBe(
      "0xf2fde38b000000000000000000000000deadbeefdeadbeefdeadbeefdeadbeefdeadbeef"
    );
  });

  it("should correctly encode batch transaction data", async () => {
    const provider = await givenConnectedProvider({ owner, chain });
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
      '"0x47e1da2a000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000deadbeefdeadbeefdeadbeefdeadbeefdeadbeef0000000000000000000000008ba1f109551bd432803012645ac136ddd64dba720000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000004deadbeef000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004cafebabe00000000000000000000000000000000000000000000000000000000"'
    );
  });
});

const givenConnectedProvider = ({
  owner,
  chain,
}: {
  owner: SmartAccountSigner;
  chain: Chain;
}) =>
  createLightAccountClient({
    account: {
      owner,
      accountAddress: "0xb856DBD4fA1A79a46D426f537455e7d3E79ab7c4",
    },
    client: createPublicErc4337FromClient(
      createPublicClient({
        transport: custom({
          request: async ({ method }) => {
            if (method === "eth_getStorageAt") {
              return "0xae8c656ad28F2B59a196AB61815C16A0AE1c3cba"; // v1.1.0 address
            }
            return;
          },
        }),
        chain,
      })
    ),
  });
