import {
  LocalAccountSigner,
  polygonMumbai,
  type BatchUserOperationCallData,
  type SmartAccountSigner,
} from "@aa-sdk/core";
import { custom, type Chain } from "viem";
import { createLightAccountClient } from "../clients/client.js";
import type { LightAccountVersion } from "../types.js";
import { AccountVersionRegistry } from "../utils.js";

const chain = polygonMumbai;

const versions = Object.keys(
  AccountVersionRegistry.LightAccount
) as LightAccountVersion[];

describe("Light Account Tests", () => {
  const dummyMnemonic =
    "test test test test test test test test test test test junk";
  const signer: SmartAccountSigner =
    LocalAccountSigner.mnemonicToAccountSigner(dummyMnemonic);

  it.each(versions)(
    "should return correct dummy signature",
    async (version) => {
      const { account } = await givenConnectedProvider({
        signer,
        chain,
        version,
      });
      switch (version) {
        case "v1.0.1":
        case "v1.0.2":
        case "v1.1.0":
          expect(account.getDummySignature()).toBe(
            "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c"
          );
          break;
        case "v2.0.0":
          expect(account.getDummySignature()).toBe(
            "0x00fffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c"
          );
          break;
        default:
          throw new Error(`Unknown version ${version}`);
      }
    }
  );

  it.each(versions)("should correctly sign the message", async (version) => {
    const { account } = await givenConnectedProvider({
      signer,
      chain,
      version,
    });
    const message =
      "0xa70d0af2ebb03a44dcd0714a8724f622e3ab876d0aa312f0ee04823285d6fb1b";
    switch (version) {
      case "v1.0.1":
        expect(await account.signMessage({ message })).toBe(
          "0x53f3169bd14b5ade19a0488bf04ba94a1afa46549014febf3d20d2850a92c98f200c729d723b0592c8b4cb64c0423bb40c5a7fb49f69f4ef5f71ecc672e782e71b"
        );
        break;
      case "v1.0.2":
        await expect(account.signMessage({ message })).rejects.toThrowError(
          "LightAccount v1.0.2 doesn't support 1271"
        );
        break;
      case "v1.1.0":
        expect(await account.signMessage({ message })).toBe(
          "0x394dcd53572e316d1bf7a5f3be71a4189e1ab1269f57691699f7b18b209e340b63d27ae7b314445fd5a9db5a442278fadd3dc022a9e35a1b5ea20e891c22c8b21c"
        );
        break;
      case "v2.0.0":
        expect(await account.signMessage({ message })).toBe(
          "0x00394dcd53572e316d1bf7a5f3be71a4189e1ab1269f57691699f7b18b209e340b63d27ae7b314445fd5a9db5a442278fadd3dc022a9e35a1b5ea20e891c22c8b21c"
        );
        break;
      default:
        throw new Error(`Unknown version ${version}`);
    }
  });

  it.each(versions)("should correctly sign typed data", async (version) => {
    const { account } = await givenConnectedProvider({
      signer,
      chain,
      version,
    });
    const typedData = {
      types: {
        Request: [{ name: "hello", type: "string" }],
      },
      primaryType: "Request",
      message: {
        hello: "world",
      },
    } as const;
    switch (version) {
      case "v1.0.1":
        expect(await account.signTypedData(typedData)).toBe(
          "0x974c40bb8038696abf26fc9134676b9afd44bcfbe6821acd523193d80a354cfc7f3e8fdc28358c5551231156cec29e1c234ffe9cad09d51d633736d582d997811b"
        );
        break;
      case "v1.0.2":
        await expect(account.signTypedData(typedData)).rejects.toThrowError(
          "Version v1.0.2 of LightAccount doesn't support 1271"
        );
        break;
      case "v1.1.0":
        expect(await account.signTypedData(typedData)).toBe(
          "0xf1b620ac60e03d01ccc737ad02feffe8631c6f9947083d53ef4f5182eb150d187ec9f7be44bd015ca4e0efb235fdc6f130542ebf31aecb1a736e31ef736a67321b"
        );
        break;
      case "v2.0.0":
        expect(await account.signTypedData(typedData)).toBe(
          "0x00f1b620ac60e03d01ccc737ad02feffe8631c6f9947083d53ef4f5182eb150d187ec9f7be44bd015ca4e0efb235fdc6f130542ebf31aecb1a736e31ef736a67321b"
        );
        break;
      default:
        throw new Error(`Unknown version ${version}`);
    }
  });

  it.each(versions)(
    "should correctly encode transferOwnership data",
    async (version) => {
      const { account } = await givenConnectedProvider({
        signer,
        chain,
        version,
      });
      expect(
        account.encodeTransferOwnership(
          "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef"
        )
      ).toBe(
        "0xf2fde38b000000000000000000000000deadbeefdeadbeefdeadbeefdeadbeefdeadbeef"
      );
    }
  );

  it.each(versions)(
    "should correctly encode batch transaction data",
    async (version) => {
      const provider = await givenConnectedProvider({ signer, chain, version });
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

      expect(await provider.account.encodeBatchExecute(data)).toBe(
        "0x47e1da2a000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000deadbeefdeadbeefdeadbeefdeadbeefdeadbeef0000000000000000000000008ba1f109551bd432803012645ac136ddd64dba720000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000004deadbeef000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004cafebabe00000000000000000000000000000000000000000000000000000000"
      );
    }
  );
});

const givenConnectedProvider = ({
  signer,
  chain,
  version,
}: {
  signer: SmartAccountSigner;
  chain: Chain;
  version: LightAccountVersion;
}) =>
  createLightAccountClient({
    account: {
      signer,
      accountAddress: "0xb856DBD4fA1A79a46D426f537455e7d3E79ab7c4",
      version,
    },
    transport: custom({
      request: async ({ method }) => {
        if (method === "eth_getStorageAt") {
          return AccountVersionRegistry.LightAccount[version].address[chain.id]
            .impl;
        }
        return;
      },
    }),
    chain,
  });
