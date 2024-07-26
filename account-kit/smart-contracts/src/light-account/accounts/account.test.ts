import {
  erc7677Middleware,
  LocalAccountSigner,
  type BatchUserOperationCallData,
  type SmartAccountSigner,
  type UserOperationCallData,
  type UserOperationOverrides,
  type UserOperationStruct,
} from "@aa-sdk/core";
import { custom, parseEther, type Address } from "viem";
import { setBalance } from "viem/actions";
import { resetBalance } from "~test/accounts.js";
import { accounts } from "~test/constants.js";
import { localInstance } from "~test/instances.js";
import { createLightAccountClient } from "../clients/client.js";
import type { LightAccountVersion } from "../types.js";
import { AccountVersionRegistry } from "../utils.js";

const instance = localInstance;

const versions = Object.keys(
  AccountVersionRegistry.LightAccount
) as LightAccountVersion<"LightAccount">[];

describe("Light Account Tests", () => {
  const signer: SmartAccountSigner = new LocalAccountSigner(
    accounts.fundedAccountOwner
  );

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
          "0xddb694a4f22cb929476a39f63aae047c2ccd6a12df17c91ff2068d8679f7d2e57b019263691eae350ce53bc6f958d4f2200571614eab8343af9c382aa90579371c"
        );
        break;
      case "v2.0.0":
        expect(await account.signMessage({ message })).toBe(
          "0x00823ee659d8f86abaee06bb36c4d84bfefa2938af2835ff62564e9559bc671d0c0e8603a5aa3ed9603b28a137eaf491b64c55ed73007c12efebcfd9a82cb181221b"
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
          "0x7d42ec333209a34a4a64d5bcb40ba67bc8ed3751f30898be60c1eba78d127e0e06b426a1faef69aa683f92aecc6a8e2292689b03e19f41417dcfa875410bd09d1c"
        );
        break;
      case "v2.0.0":
        expect(await account.signTypedData(typedData)).toBe(
          "0x00813b860dce6079750e9383e932412620f6bc206261fed24bc450a1c858acb35912eb082c6fe69daf47f662b88941a9f67da425fa7084f2d93eb5bd2d2705905c1b"
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

  it("should successfully get counterfactual address", async () => {
    const provider = await givenConnectedProvider({ signer });
    expect(provider.getAddress()).toMatchInlineSnapshot(
      '"0x9EfDfCB56390eDd8b2eAE6daBC148CED3491AAf6"'
    );
  });

  it("should execute successfully", async () => {
    const provider = await givenConnectedProvider({ signer });

    await setBalance(instance.getClient(), {
      address: provider.getAddress(),
      value: parseEther("1"),
    });

    const result = await provider.sendUserOperation({
      uo: {
        target: provider.getAddress(),
        data: "0x",
      },
    });

    const txnHash = provider.waitForUserOperationTransaction(result);

    await expect(txnHash).resolves.not.toThrowError();
  }, 10_000);

  it("should fail to execute if account address is not deployed and not correct", async () => {
    const accountAddress = "0xc33AbD9621834CA7c6Fc9f9CC3c47b9c17B03f9F";
    const provider = await givenConnectedProvider({
      signer,
      accountAddress,
    });

    const result = provider.sendUserOperation({
      uo: {
        target: provider.getAddress(),
        data: "0x",
      },
    });

    await expect(result).rejects.toThrowError();
  });

  it(
    "should successfully execute with paymaster info",
    { retry: 2, timeout: 10_000 },
    async () => {
      const provider = await givenConnectedProvider({
        signer,
        usePaymaster: true,
      });

      const result = await provider.sendUserOperation({
        uo: {
          target: provider.getAddress(),
          data: "0x",
        },
      });

      // @ts-expect-error this is union type when used generically, but we know it's 0.6.0 for now
      // TODO: when using multiple versions, we need to check the version and cast accordingly
      expect(result.request.paymasterAndData).not.toBe("0x");

      const txnHash = provider.waitForUserOperationTransaction(result);

      await expect(txnHash).resolves.not.toThrowError();
    }
  );

  it(
    "should bypass paymaster when paymasterAndData of user operation overrides is set to 0x",
    { retry: 2 },
    async () => {
      const provider = await givenConnectedProvider({
        signer,
        usePaymaster: true,
      });

      // set the value to 0 so that we can capture an error in sending the uo
      await resetBalance(provider, instance.getClient());

      const toSend = {
        uo: {
          target: provider.getAddress(),
          data: "0x",
        } as UserOperationCallData,
        overrides: {
          paymasterAndData: "0x", // bypass paymaster
        } as UserOperationOverrides<"0.6.0">,
      };
      const uoStruct = (await provider.buildUserOperation(
        toSend
      )) as UserOperationStruct<"0.6.0">;

      expect(uoStruct.paymasterAndData).toBe("0x");

      await expect(provider.sendUserOperation(toSend)).rejects.toThrowError();
    }
  );
});

const givenConnectedProvider = ({
  signer,
  version = "v1.1.0",
  accountAddress,
  usePaymaster = false,
}: {
  signer: SmartAccountSigner;
  version?: LightAccountVersion<"LightAccount">;
  usePaymaster?: boolean;
  accountAddress?: Address;
}) =>
  createLightAccountClient({
    account: {
      signer,
      accountAddress,
      version,
    },
    transport: custom(instance.getClient()),
    chain: instance.chain,
    ...(usePaymaster ? erc7677Middleware() : {}),
  });
