import {
  LocalAccountSigner,
  type BatchUserOperationCallData,
  type SmartAccountSigner,
} from "@aa-sdk/core";
import { custom } from "viem";
import { anvilArbSepolia } from "~test/instances.js";
import { createLightAccountClient } from "../clients/client.js";
import type { LightAccountVersion } from "../types.js";
import { AccountVersionRegistry } from "../utils.js";

const instance = anvilArbSepolia;

const versions = Object.keys(
  AccountVersionRegistry.LightAccount
) as LightAccountVersion<"LightAccount">[];

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
          "0x83c1d00d561ba80bf1fe5acb8f47ecd1e796f64d853512f6a60255a973ef56636cb1a0168bf81e986b8480a2f03fe2a3c7b6bcac0ed438eda2600e950694e4bd1c"
        );
        break;
      case "v2.0.0":
        expect(await account.signMessage({ message })).toBe(
          "0x0083c1d00d561ba80bf1fe5acb8f47ecd1e796f64d853512f6a60255a973ef56636cb1a0168bf81e986b8480a2f03fe2a3c7b6bcac0ed438eda2600e950694e4bd1c"
        );
        break;
      default:
        throw new Error(`Unknown version ${version}`);
    }
  });

  it.each(versions)("should correctly sign typed data", async (version) => {
    const { account } = await givenConnectedProvider({
      signer,
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
          "0x81e2d13cc2f4748be86770e31af4c8d4728887716112f03dea2d533f751dde1d4af37dcf1fa17ff2f54f26815f4e6f91a62dfcb25d7287c49340dc1ec9f4e3481c"
        );
        break;
      case "v2.0.0":
        expect(await account.signTypedData(typedData)).toBe(
          "0x0081e2d13cc2f4748be86770e31af4c8d4728887716112f03dea2d533f751dde1d4af37dcf1fa17ff2f54f26815f4e6f91a62dfcb25d7287c49340dc1ec9f4e3481c"
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
      const provider = await givenConnectedProvider({ signer, version });
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
  version,
}: {
  signer: SmartAccountSigner;
  version: LightAccountVersion<"LightAccount">;
}) =>
  createLightAccountClient({
    account: {
      signer,
      accountAddress: "0xb856DBD4fA1A79a46D426f537455e7d3E79ab7c4",
      version,
    },
    transport: custom({
      request: instance.getClient().request,
    }),
    chain: instance.chain,
  });
