import { bigIntMultiply } from "@aa-sdk/core";
import {
  createWalletClient,
  custom,
  fromHex,
  parseEther,
  publicActions,
  type Address,
  type Chain,
  type Hex,
  type JsonRpcAccount,
  type LocalAccount,
  type OneOf,
  type Transport,
  type WalletClient,
} from "viem";
import { createBundlerClient } from "viem/account-abstraction";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { getBlock, setBalance } from "viem/actions";
import { accounts, poolId } from "~test/constants.js";
import { local070Instance } from "~test/instances.js";
import { multiOwnerLightAccountActions } from "../decorators/multiOwner.js";
import type { LightAccountVersion } from "../types";
import { toMultiOwnerLightAccount } from "./multi-owner-account.js";

describe("MultiOwner Light Account Tests", () => {
  const instance = local070Instance;
  let client: ReturnType<typeof instance.getClient>;
  let salt: bigint = BigInt(poolId());
  let signer: WalletClient<Transport, Chain, JsonRpcAccount | LocalAccount>;
  let undeployedSigner: WalletClient<
    Transport,
    Chain,
    JsonRpcAccount | LocalAccount
  >;
  let fundedAccountSigner: WalletClient<
    Transport,
    Chain,
    JsonRpcAccount | LocalAccount
  >;

  beforeAll(async () => {
    client = instance.getClient();
    signer = createWalletClient({
      account: privateKeyToAccount(generatePrivateKey()),
      transport: custom(client.transport),
      chain: client.chain,
    });
    undeployedSigner = createWalletClient({
      account: accounts.unfundedAccountOwner,
      transport: custom(client.transport),
      chain: client.chain,
    });
    fundedAccountSigner = createWalletClient({
      account: accounts.fundedAccountOwner,
      transport: custom(client.transport),
      chain: client.chain,
    });
  });

  it("should successfully get counterfactual address", async () => {
    const provider = await givenConnectedProvider({
      signer: fundedAccountSigner,
      salt: 0n,
    });
    expect(provider.account.address).toMatchInlineSnapshot(
      '"0x6ef8bb149c4422a33f87eF6A406B601D8F964b65"',
    );
  });

  it("should execute successfully", async () => {
    const provider = await givenConnectedProvider({ signer });

    await setBalance(client, {
      address: provider.account.address,
      value: parseEther("10"),
    });

    const result = provider.sendUserOperation({
      calls: [
        {
          to: provider.account.entryPoint.address,
          data: "0x",
          value: parseEther("1"),
        },
      ],
    });

    await expect(result).resolves.not.toThrowError();
  });

  it("should fail to execute if account address is not deployed and not correct", async () => {
    const accountAddress = "0xc33AbD9621834CA7c6Fc9f9CC3c47b9c17B03f9F";
    const provider = await givenConnectedProvider({
      signer,
      accountAddress,
    });

    const result = provider.sendUserOperation({
      calls: [
        {
          to: provider.account.address,
          data: "0x",
        },
      ],
    });

    await expect(result).rejects.toThrowError();
  });

  it("should successfully execute with erc-7677 paymaster", async () => {
    const provider = await givenConnectedProvider({
      signer,
      usePaymaster: true,
    });

    const hash = await provider.sendUserOperation({
      calls: [
        {
          to: provider.account.address,
          data: "0x",
        },
      ],
    });

    const txnHash = provider.waitForUserOperationReceipt({ hash });

    await expect(txnHash).resolves.not.toThrowError();
  }, 30_000);

  it("should sign typed data with 6492 successfully for undeployed account", async () => {
    const { account } = await givenConnectedProvider({
      signer: undeployedSigner,
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

    const signature = await account.signTypedData(typedData);

    expect(
      await client.extend(publicActions).verifyTypedData({
        address: account.address,
        signature,
        ...typedData,
      }),
    ).toBe(true);
  });

  it("should sign message with 6492 successfully for undeployed account", async () => {
    const { account } = await givenConnectedProvider({
      signer: undeployedSigner,
    });
    const message = "test";

    const signature = await account.signMessage({ message });
    expect(
      await client.extend(publicActions).verifyMessage({
        address: account.address,
        message,
        signature,
      }),
    ).toBe(true);
  });

  it("should get on-chain owner addresses successfully", async () => {
    const provider = await givenConnectedProvider({
      signer: fundedAccountSigner,
      owners: [undeployedSigner.account],
    });

    await setBalance(instance.getClient(), {
      address: provider.account.address,
      value: parseEther("10"),
    });

    // deploy the account one time
    const result = await provider.sendUserOperation({
      calls: [
        {
          to: provider.account.entryPoint.address,
          data: "0x",
          value: 0n,
        },
      ],
    });

    await provider.waitForUserOperationReceipt({ hash: result });

    expect(await provider.account.getOwnerAddresses()).toMatchInlineSnapshot(`
      [
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "0x8391DE4cACFB91f1cF953Cf345948D92E137B6b9",
      ]
    `);
    // match with current signer
    expect(await provider.account.getOwnerAddresses()).toContain(
      fundedAccountSigner.account.address,
    );
  });

  it("should update ownership successfully", async () => {
    // create a throwaway address
    const throwawaySigner = createWalletClient({
      account: privateKeyToAccount(generatePrivateKey()),
      transport: custom(client.transport),
      chain: client.chain,
    });

    const throwawayClient = await givenConnectedProvider({
      signer: throwawaySigner,
    });

    // fund the throwaway address
    await setBalance(client, {
      address: throwawayClient.account.address,
      value: 200000000000000000n,
    });

    // create new signer and transfer ownership
    const newOwner = createWalletClient({
      account: privateKeyToAccount(generatePrivateKey()),
      transport: custom(client.transport),
      chain: client.chain,
    });

    const hash = await throwawayClient.updateOwners({
      ownersToAdd: [newOwner.account.address],
      ownersToRemove: [throwawaySigner.account.address],
    });

    await throwawayClient.waitForUserOperationReceipt({ hash });

    const newOwnerClient = await givenConnectedProvider({
      signer: newOwner,
      accountAddress: throwawayClient.account.address,
    });

    const newOwnerAddresses = await newOwnerClient.account.getOwnerAddresses();

    expect(newOwnerAddresses).not.toContain(throwawaySigner.account.address);
    expect(newOwnerAddresses).toContain(newOwner.account.address);
  }, 100000);

  // TODO(v5): implement test for upgrading account to MSCA?

  const givenConnectedProvider = async ({
    signer,
    accountAddress,
    usePaymaster = false,
    owners,
    salt: _salt,
  }: {
    signer: WalletClient<Transport, Chain, JsonRpcAccount | LocalAccount>;
    version?: LightAccountVersion<"MultiOwnerLightAccount">;
    accountAddress?: Address;
    usePaymaster?: boolean;
    owners?: OneOf<JsonRpcAccount | LocalAccount>[];
    salt?: bigint;
  }) => {
    const account = await toMultiOwnerLightAccount({
      client: signer,
      accountAddress,
      salt: _salt ?? salt++,
      owners: [signer.account, ...(owners ?? [])],
    });

    return createBundlerClient({
      account,
      transport: custom(client.transport),
      chain: client.chain,
      paymaster: usePaymaster ? true : undefined,
      userOperation: {
        // TODO(v5): move this to the common package so it can be reused
        estimateFeesPerGas: async ({ bundlerClient }) => {
          let [block, maxPriorityFeePerGasEstimate] = await Promise.all([
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
              "bigint",
            ),
            maxFeePerGas:
              bigIntMultiply(baseFeePerGas, 1.5) +
              BigInt(maxPriorityFeePerGasEstimate as Hex),
          };
        },
      },
    }).extend(multiOwnerLightAccountActions);
  };
});
