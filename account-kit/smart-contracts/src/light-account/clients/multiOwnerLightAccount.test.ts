import {
  createBundlerClient,
  createSmartAccountClientFromExisting,
  erc7677Middleware,
  LocalAccountSigner,
  type Address,
  type SmartAccountSigner,
} from "@aa-sdk/core";
import {
  alchemyFeeEstimator,
  alchemyGasAndPaymasterAndDataMiddleware,
} from "@account-kit/infra";
import { custom, parseEther, publicActions, zeroAddress } from "viem";
import { generatePrivateKey } from "viem/accounts";
import { setBalance } from "viem/actions";
import { accounts, poolId } from "~test/constants.js";
import { local070Instance } from "~test/instances.js";
import { multiOwnerPluginActions } from "../../msca/plugins/multi-owner/index.js";
import { getMSCAUpgradeToData } from "../../msca/utils.js";
import type { LightAccountVersion } from "../types";
import { createMultiOwnerLightAccountClient } from "./multiOwnerLightAccount.js";

describe("MultiOwner Light Account Tests", () => {
  const instance = local070Instance;
  let client: ReturnType<typeof instance.getClient>;
  let salt: bigint = BigInt(poolId());

  beforeAll(async () => {
    client = instance.getClient();
  });

  const signer: SmartAccountSigner =
    LocalAccountSigner.generatePrivateKeySigner();

  const undeployedSigner: SmartAccountSigner = new LocalAccountSigner(
    accounts.unfundedAccountOwner,
  );

  it("should successfully get counterfactual address", async () => {
    const provider = await givenConnectedProvider({
      signer: new LocalAccountSigner(accounts.fundedAccountOwner),
      accountIndex: 0n,
    });
    expect(provider.getAddress()).toMatchInlineSnapshot(
      '"0x6ef8bb149c4422a33f87eF6A406B601D8F964b65"',
    );
  });

  it("should execute successfully", async () => {
    const provider = await givenConnectedProvider({ signer });

    await setBalance(client, {
      address: provider.getAddress(),
      value: parseEther("10"),
    });

    const result = provider.sendUserOperation({
      uo: {
        target: provider.account.getEntryPoint().address,
        data: "0x",
        value: parseEther("1"),
      },
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
      uo: {
        target: provider.getAddress(),
        data: "0x",
      },
    });

    await expect(result).rejects.toThrowError();
  });

  it(
    "should successfully execute with erc-7677 paymaster",
    async () => {
      const provider = await givenConnectedProvider({
        signer,
        paymasterMiddleware: "erc7677",
      });

      const result = await provider.sendUserOperation({
        uo: {
          target: zeroAddress,
          data: "0x",
          value: 0n,
        },
      });

      const txnHash = provider.waitForUserOperationTransaction(result);

      await expect(txnHash).resolves.not.toThrowError();
    },
    { timeout: 30_000, retry: 3 },
  );

  it(
    "should successfully execute with alchemy paymaster",
    async () => {
      const provider = await givenConnectedProvider({
        signer,
        paymasterMiddleware: "alchemyGasAndPaymasterAndData",
      });

      const result = await provider.sendUserOperation({
        uo: {
          target: zeroAddress,
          data: "0x",
          value: 0n,
        },
      });

      const txnHash = provider.waitForUserOperationTransaction(result);

      await expect(txnHash).resolves.not.toThrowError();
    },
    { timeout: 30_000, retry: 3 },
  );

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

    const signature = await account.signTypedDataWith6492(typedData);

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

    const signature = await account.signMessageWith6492({ message });
    expect(
      await client.extend(publicActions).verifyMessage({
        address: account.address,
        message,
        signature,
      }),
    ).toBe(true);
  });

  it("should get on-chain owner addresses successfully", async () => {
    const signer = new LocalAccountSigner(accounts.fundedAccountOwner);
    const client = await givenConnectedProvider({
      signer,
    });

    await setBalance(instance.getClient(), {
      address: client.getAddress(),
      value: parseEther("10"),
    });

    // deploy the account one time
    const result = await client.sendUserOperation({
      uo: [
        {
          target: client.account.getEntryPoint().address,
          data: "0x",
          value: 0n,
        },
      ],
    });

    await client.waitForUserOperationTransaction(result);

    expect(await client.account.getOwnerAddresses()).toMatchInlineSnapshot(`
      [
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      ]
    `);
    // match with current signer
    expect(await client.account.getOwnerAddresses()).toContain(
      await signer.getAddress(),
    );
  });

  it("should update ownership successfully", async () => {
    // create a throwaway address
    const throwawaySigner =
      LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey());
    const throwawayClient = await givenConnectedProvider({
      signer: throwawaySigner,
    });

    // fund the throwaway address
    await setBalance(client, {
      address: throwawayClient.getAddress(),
      value: 200000000000000000n,
    });

    // create new signer and transfer ownership
    const newOwner =
      LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey());

    await throwawayClient.updateOwners({
      ownersToAdd: [await newOwner.getAddress()],
      ownersToRemove: [await throwawaySigner.getAddress()],
      waitForTxn: true,
    });

    const newOwnerClient = await givenConnectedProvider({
      signer: newOwner,
      accountAddress: throwawayClient.getAddress(),
    });

    const newOwnerAddresses = await newOwnerClient.account.getOwnerAddresses();

    expect(newOwnerAddresses).not.toContain(await throwawaySigner.getAddress());
    expect(newOwnerAddresses).toContain(await newOwner.getAddress());
  }, 100000);

  it("should upgrade a deployed multi owner light account to msca successfully", async () => {
    // create a owner signer to create the account
    const throwawaySigner =
      LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey());
    const throwawayClient = await givenConnectedProvider({
      signer: throwawaySigner,
    });

    const accountAddress = throwawayClient.getAddress();
    const ownerAddress = await throwawaySigner.getAddress();

    // fund + deploy the throwaway address
    await setBalance(client, {
      address: accountAddress,
      value: 200000000000000000n,
    });

    const { createMAAccount, ...upgradeToData } = await getMSCAUpgradeToData(
      throwawayClient,
      {
        account: throwawayClient.account,
        multiOwnerPluginAddress: "0xcE0000007B008F50d762D155002600004cD6c647",
      },
    );

    await throwawayClient.upgradeAccount({
      upgradeTo: upgradeToData,
      waitForTx: true,
    });

    const upgradedClient = createSmartAccountClientFromExisting({
      client: createBundlerClient({
        chain: instance.chain,
        transport: custom(client),
      }),
      account: await createMAAccount(),
    }).extend(multiOwnerPluginActions);

    const upgradedAccountAddress = upgradedClient.getAddress();

    const owners = await upgradedClient.readOwners({
      account: upgradedClient.account,
      pluginAddress: "0xcE0000007B008F50d762D155002600004cD6c647",
    });

    expect(upgradedAccountAddress).toBe(accountAddress);
    expect(owners).toContain(ownerAddress);
  }, 200000);

  const givenConnectedProvider = ({
    signer,
    version = "v2.0.0",
    accountAddress,
    paymasterMiddleware,
    accountIndex,
  }: {
    signer: SmartAccountSigner;
    version?: LightAccountVersion<"MultiOwnerLightAccount">;
    paymasterMiddleware?: "alchemyGasAndPaymasterAndData" | "erc7677";
    accountAddress?: Address;
    accountIndex?: bigint;
  }) =>
    createMultiOwnerLightAccountClient({
      signer,
      accountAddress,
      version,
      transport: custom(client),
      chain: instance.chain,
      salt: accountIndex ?? salt++,
      feeEstimator: alchemyFeeEstimator(
        // @ts-ignore (expects an alchemy transport, but we're using a custom transport for mocking)
        custom(instance.getClient()),
      ),
      ...(paymasterMiddleware === "alchemyGasAndPaymasterAndData"
        ? alchemyGasAndPaymasterAndDataMiddleware({
            policyId: "FAKE_POLICY_ID",
            // @ts-ignore (expects an alchemy transport, but we're using a custom transport for mocking)
            transport: custom(instance.getClient()),
          })
        : paymasterMiddleware === "erc7677"
          ? erc7677Middleware()
          : {}),
    });
});
