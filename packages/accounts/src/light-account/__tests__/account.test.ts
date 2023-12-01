import {
  LocalAccountSigner,
  type BatchUserOperationCallData,
  type SmartAccountSigner,
} from "@alchemy/aa-core";
import { polygonMumbai, type Chain } from "viem/chains";
import { describe, it } from "vitest";
import { LightSmartContractAccount } from "../account.js";
import { createLightAccountProvider } from "../provider.js";

const chain = polygonMumbai;

describe("Light Account Tests", () => {
  const dummyMnemonic =
    "test test test test test test test test test test test test";
  const owner: SmartAccountSigner =
    LocalAccountSigner.mnemonicToAccountSigner(dummyMnemonic);

  it("should correctly sign the message", async () => {
    const provider = givenConnectedProvider({ owner, chain });
    expect(
      await provider.signMessage(
        "0xa70d0af2ebb03a44dcd0714a8724f622e3ab876d0aa312f0ee04823285d6fb1b"
      )
    ).toBe(
      "0x33b1b0d34ba3252cd8abac8147dc08a6e14a6319462456a34468dd5713e38dda3a43988460011af94b30fa3efefcf9d0da7d7522e06b7bd8bff3b65be4aee5b31c"
    );
  });

  it("should correctly sign typed data", async () => {
    const provider = givenConnectedProvider({ owner, chain });
    expect(
      await provider.signTypedData({
        types: {
          Request: [{ name: "hello", type: "string" }],
        },
        primaryType: "Request",
        message: {
          hello: "world",
        },
      })
    ).toBe(
      "0xda1aeed13916d5723579f26cb9116155945d3581d642c38d8e2bce9fc969014f3eb599fa375df3d6e8181c8f04db64819186ac44cf5fd2bdd90e9f8543c579461b"
    );
  });

  it("should correctly encode transferOwnership data", async () => {
    expect(
      LightSmartContractAccount.encodeTransferOwnership(
        "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef"
      )
    ).toBe(
      "0xf2fde38b000000000000000000000000deadbeefdeadbeefdeadbeefdeadbeefdeadbeef"
    );
  });

  it("should correctly encode batch transaction data", async () => {
    const provider = givenConnectedProvider({ owner, chain });
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
});

const givenConnectedProvider = ({
  owner,
  chain,
}: {
  owner: SmartAccountSigner;
  chain: Chain;
}) =>
  createLightAccountProvider({
    owner,
    chain,
    rpcProvider: `${chain.rpcUrls.alchemy.http[0]}/${"test"}`,
    accountAddress: "0xb856DBD4fA1A79a46D426f537455e7d3E79ab7c4",
  });
