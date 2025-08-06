import { bigIntMultiply } from "@aa-sdk/core"; // TODO(v5): remove aa-sdk/core dependency
import {
  createWalletClient,
  custom,
  fromHex,
  parseEther,
  publicActions,
  type Address,
  type Call,
  type Hex,
  type LocalAccount,
} from "viem";
import { createBundlerClient } from "viem/account-abstraction";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { getBlock, setBalance } from "viem/actions";
import { accounts } from "~test/constants.js";
import { local060Instance } from "~test/instances.js";
import { singleOwnerLightAccountActions } from "../decorators/singleOwner.js";
import type { LightAccountVersion } from "../types.js";
import { AccountVersionRegistry } from "../utils.js";
import { toLightAccount } from "./account.js";

const versions = Object.keys(
  AccountVersionRegistry.LightAccount
) as LightAccountVersion<"LightAccount">[];

describe("Light Account Tests", () => {
  let instance = local060Instance;
  let client: ReturnType<typeof instance.getClient>;
  const signerAccount = privateKeyToAccount(generatePrivateKey());

  beforeAll(async () => {
    client = instance.getClient();
  });

  it.each(versions)(
    "should return correct dummy signature",
    async (version) => {
      const { account } = await givenConnectedProvider({
        signerAccount,
        version,
      });
      switch (version) {
        case "v1.0.1":
        case "v1.0.2":
        case "v1.1.0":
          expect(await account.getStubSignature()).toBe(
            "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c"
          );
          break;
        case "v2.0.0":
          expect(await account.getStubSignature()).toBe(
            "0x00fffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c"
          );
          break;
        default:
          throw new Error(`Unknown version ${version}`);
      }
    }
  );

  it.each(versions)("should correctly sign the message", async (version) => {
    const provider = await givenConnectedProvider({
      signerAccount,
      version,
    });

    const { account } = provider;

    const message = "hello world";
    switch (version) {
      case "v1.0.2":
        await expect(account.signMessage({ message })).rejects.toThrowError(
          "Version v1.0.2 of LightAccount doesn't support 1271"
        );
        break;
      case "v1.0.1":
      case "v1.1.0":
      case "v2.0.0":
        {
          const signature = await account.signMessage({
            message,
          });

          // We must use a public client, rather than an account client, to verify the message, because AA-SDK incorrectly attaches the account address as a "from" field to all actions taken by that client, including the `eth_call` used internally by viem's signature verifier logic. Per EIP-684, contract creation reverts on non-zero nonce, and the `eth_call`'s from field implicitly increases the nonce of the account contract, causing the contract creation to revert.
          expect(
            await client.extend(publicActions).verifyMessage({
              address: account.address,
              message,
              signature,
            })
          ).toBe(true);
        }
        break;
      default:
        throw new Error(`Unknown version ${version}`);
    }
  });

  it.each(versions)("should correctly sign typed data", async (version) => {
    const { account } = await givenConnectedProvider({
      signerAccount,
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
      case "v1.0.2":
        await expect(account.signTypedData(typedData)).rejects.toThrowError(
          "Version v1.0.2 of LightAccount doesn't support 1271"
        );
        break;
      case "v1.1.0":
      case "v1.0.1":
      case "v2.0.0":
        {
          const signature = await account.signTypedData(typedData);

          // See above comment for context on the duplicate client.
          expect(
            await client.extend(publicActions).verifyTypedData({
              address: account.address,
              signature,
              ...typedData,
            })
          ).toBe(true);
        }
        break;
      default:
        throw new Error(`Unknown version ${version}`);
    }
  });

  it.each(versions)(
    "should correctly encode transferOwnership data",
    async (version) => {
      const { account } = await givenConnectedProvider({
        signerAccount,
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
      const provider = await givenConnectedProvider({ signerAccount, version });
      const data = [
        {
          to: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
          data: "0xdeadbeef",
        },
        {
          to: "0x8ba1f109551bd432803012645ac136ddd64dba72",
          data: "0xcafebabe",
        },
      ] satisfies Call[];

      expect(await provider.account.encodeCalls(data)).toBe(
        "0x47e1da2a000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000deadbeefdeadbeefdeadbeefdeadbeefdeadbeef0000000000000000000000008ba1f109551bd432803012645ac136ddd64dba720000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000004deadbeef000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004cafebabe00000000000000000000000000000000000000000000000000000000"
      );
    }
  );

  it("should successfully get counterfactual address", async () => {
    const provider = await givenConnectedProvider({
      signerAccount: accounts.fundedAccountOwner,
    });
    expect(provider.account.address).toMatchInlineSnapshot(
      '"0x9EfDfCB56390eDd8b2eAE6daBC148CED3491AAf6"'
    );
  });

  it("should execute successfully", async () => {
    const provider = await givenConnectedProvider({
      signerAccount,
    });

    await setBalance(instance.getClient(), {
      address: provider.account.address,
      value: parseEther("10"),
    });

    const result = await provider.sendUserOperation({
      calls: [
        {
          to: provider.account.entryPoint.address,
          data: "0x",
          value: parseEther("1"),
        },
      ],
    });

    const receipt = provider.waitForUserOperationReceipt({ hash: result });

    await expect(receipt).resolves.not.toThrowError();
  }, 30_000);

  it("should execute successfully after account has already been deployed", async () => {
    const provider = await givenConnectedProvider({
      signerAccount,
    });

    await setBalance(instance.getClient(), {
      address: provider.account.address,
      value: parseEther("10"),
    });

    const result = await provider.sendUserOperation({
      calls: [
        {
          to: provider.account.entryPoint.address,
          data: "0x",
          value: parseEther("1"),
        },
      ],
    });

    const receipt = provider.waitForUserOperationReceipt({ hash: result });

    await expect(receipt).resolves.not.toThrowError();

    const result2 = await provider.sendUserOperation({
      calls: [
        {
          to: provider.account.entryPoint.address,
          data: "0x",
          value: parseEther("1"),
        },
      ],
    });

    const receipt2 = provider.waitForUserOperationReceipt({ hash: result2 });
    await expect(receipt2).resolves.not.toThrowError();
  }, 30_000);

  it("should fail to execute if account address is not deployed and not correct", async () => {
    const accountAddress = "0xc33AbD9621834CA7c6Fc9f9CC3c47b9c17B03f9F";
    const provider = await givenConnectedProvider({
      signerAccount,
      accountAddress,
    });

    const result = provider.sendUserOperation({
      calls: [
        {
          to: provider.account.entryPoint.address,
          data: "0x",
        },
      ],
    });

    await expect(result).rejects.toThrowError();
  });

  it("should successfully execute with paymaster info using erc-7677 middleware", async () => {
    const provider = await givenConnectedProvider({
      signerAccount,
      usePaymaster: true,
    });

    await setBalance(instance.getClient(), {
      address: provider.account.address,
      value: parseEther("0"),
    });

    const result = await provider.sendUserOperation({
      calls: [
        {
          to: provider.account.entryPoint.address,
          data: "0x",
        },
      ],
    });

    const receipt = provider.waitForUserOperationReceipt({ hash: result });

    await expect(receipt).resolves.not.toThrowError();
  });

  it("should transfer ownership successfully", async () => {
    // create a throwaway address
    const throwawaySigner = privateKeyToAccount(generatePrivateKey());
    const throwawayClient = await givenConnectedProvider({
      signerAccount: throwawaySigner,
    });

    // fund the throwaway address
    await setBalance(client, {
      address: throwawayClient.account.address,
      value: 200000000000000000n,
    });

    // create new signer and transfer ownership
    const newOwner = privateKeyToAccount(generatePrivateKey());

    const hash = await throwawayClient.transferOwnership({
      newOwner: newOwner.address,
    });

    await throwawayClient.waitForUserOperationReceipt({ hash });

    const newOwnerClient = await givenConnectedProvider({
      signerAccount: newOwner,
      accountAddress: throwawayClient.account.address,
    });

    const newOwnerAddress = await newOwnerClient.account.getOwnerAddress();

    expect(newOwnerAddress).not.toBe(throwawaySigner.address);
    expect(newOwnerAddress).toBe(newOwner.address);
  }, 100000);

  it.each(versions)(
    "should expose prepare and format functions that work",
    async (version) => {
      if (version !== "v1.0.2") {
        const provider = await givenConnectedProvider({
          signerAccount,
          version,
        });
        const message = "hello world";

        const { type, data } = await provider.account.prepareSignature({
          type: "personal_sign",
          data: message,
        });

        const signature = await provider.account.formatSignature(
          await (type === "personal_sign"
            ? signerAccount.signMessage({ message: data })
            : signerAccount.signTypedData(data))
        );

        const fullSignature = await provider.account.signMessage({ message });

        // We use `includes` to check against 6492, and slice to remove the 0x prefix
        expect(fullSignature.includes(signature.slice(2))).toBe(true);
      }
    }
  );

  // TODO(v5): implement test for upgrading account to MSCA?

  // TODO(v5): implement test for upgrading account to MAv2 (prob will do this in the MAv2 tests)

  const givenConnectedProvider = async ({
    version = "v1.1.0",
    accountAddress,
    signerAccount,
    usePaymaster = false,
  }: {
    signerAccount: LocalAccount;
    version?: LightAccountVersion<"LightAccount">;
    accountAddress?: Address;
    usePaymaster?: boolean;
  }) => {
    const account = await toLightAccount({
      client: createWalletClient({
        account: signerAccount,
        transport: custom(client.transport),
        chain: client.chain,
      }),
      version,
      accountAddress,
      owner: signerAccount,
    });

    return createBundlerClient({
      account,
      transport: custom(client.transport),
      chain: client.chain,
      paymaster: usePaymaster ? true : undefined,
      userOperation: {
        // TODO(v5): move this to the common package so it can be reused
        estimateFeesPerGas: async ({ bundlerClient }) => {
          const [block, maxPriorityFeePerGasEstimate] = await Promise.all([
            getBlock(bundlerClient, { blockTag: "latest" }),
            // it is a fair assumption that if someone is using this Alchemy Middleware, then they are using Alchemy RPC
            bundlerClient.request({
              // @ts-expect-error - TODO(v5): fix this
              method: "rundler_maxPriorityFeePerGas",
              params: [],
            }),
          ]);

          const baseFeePerGas = block.baseFeePerGas;
          if (baseFeePerGas == null) {
            throw new Error("baseFeePerGas is null");
          }

          return {
            maxPriorityFeePerGas: fromHex(
              maxPriorityFeePerGasEstimate as Hex,
              "bigint"
            ),
            maxFeePerGas:
              bigIntMultiply(baseFeePerGas, 1.5) +
              BigInt(maxPriorityFeePerGasEstimate as Hex),
          };
        },
      },
    }).extend((client) => singleOwnerLightAccountActions(client));
  };
});
