import {
  toCoinbaseSmartAccount,
  bundlerActions,
} from "viem/account-abstraction";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { 
  alchemyGasManagerHooks,
  alchemyGasAndPaymasterAndDataHooks 
} from "../../../account-kit/infra/src/hooks/alchemyGasManagerHooks.js";
import { getBlockNumber, setBalance, getBalance } from "viem/actions";
import { parseEther, custom, publicActions } from "viem";
import { describe, it, expect, beforeAll } from "vitest";
import { local070Instance } from "~test/instances.js";
import { createAlchemyBundlerClient } from "../src/clients.js";

describe("Viem AA - Coinbase Smart Account", () => {
  let client: ReturnType<typeof local070Instance.getClient>;

  beforeAll(async () => {
    client = local070Instance.getClient();
    const blockNumber = await getBlockNumber(client);
    expect(blockNumber).toBeGreaterThan(0n);
  }, 30_000);

  it("should create a Coinbase smart account successfully", async () => {
    const owner = privateKeyToAccount(generatePrivateKey());

    const account = await toCoinbaseSmartAccount({
      client,
      owners: [owner],
    });

    expect(account).toBeDefined();
    expect(account.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
    expect(account.type).toBe("smart");
  });

  it("should send a user operation (ETH transfer)", async () => {
    const owner = privateKeyToAccount(generatePrivateKey());

    const account = await toCoinbaseSmartAccount({
      client,
      owners: [owner],
    });

    // Create a bundler client that uses the Alchemy fee estimator
    const bundlerClient = createAlchemyBundlerClient({
      account,
      chain: local070Instance.chain,
      transport: custom(client),
      ...alchemyGasManagerHooks("test-policy"),
    });

    // Fund the account
    await setBalance(client, {
      address: account.address,
      value: parseEther("2.0"),
    });

    const recipient = "0x000000000000000000000000000000000000dEaD";
    const amount = parseEther("0.1");

    const initialBalance = await getBalance(client, {
      address: recipient,
    });

    // Send the user operation
    const userOpHash = await bundlerClient.sendUserOperation({
      account,
      calls: [
        {
          to: recipient,
          value: amount,
          data: "0x",
        },
      ],
    });

    expect(userOpHash).toBeDefined();
    expect(userOpHash).toMatch(/^0x[a-fA-F0-9]{64}$/);

    // Wait for the user operation to be included
    const receipt = await bundlerClient.waitForUserOperationReceipt({
      hash: userOpHash,
    });

    expect(receipt).toBeDefined();
    expect(receipt.success).toBe(true);

    const finalBalance = await getBalance(client, {
      address: recipient,
    });

    expect(finalBalance).toBe(initialBalance + amount);

    // Account should be deployed after the first user operation
    expect(await account.isDeployed()).toBe(true);
  }, 60_000);

  it("should verify signature using EIP-1271 after deployment", async () => {
    const owner = privateKeyToAccount(generatePrivateKey());

    const account = await toCoinbaseSmartAccount({
      client,
      owners: [owner],
    });

    const bundlerClient = createAlchemyBundlerClient({
      account,
      chain: local070Instance.chain,
      transport: custom(client),
      ...alchemyGasManagerHooks("test-policy"),
    }).extend(bundlerActions);

    // Fund and deploy the account
    await setBalance(client, {
      address: account.address,
      value: parseEther("1.0"),
    });

    // Deploy by sending a simple transaction to self
    const deployHash = await bundlerClient.sendUserOperation({
      account,
      calls: [
        {
          to: account.address,
          value: 0n,
          data: "0x",
        },
      ],
    });

    await bundlerClient.waitForUserOperationReceipt({
      hash: deployHash,
    });

    // Now the account is deployed, let's sign and verify
    const message = "Hello from deployed Coinbase Smart Wallet!";
    const signature = await account.signMessage({ message });

    // Create a public client for verification
    const publicClient = client.extend(publicActions);

    // For smart accounts, we use verifyMessage which should handle EIP-1271
    const isValid = await publicClient.verifyMessage({
      address: account.address,
      message,
      signature,
    });

    expect(isValid).toBe(true);
  }, 60_000);

  it("should verify EIP-6492 signatures for pre-deployed accounts", async () => {
    const owner = privateKeyToAccount(generatePrivateKey());

    const account = await toCoinbaseSmartAccount({
      client,
      owners: [owner],
    });

    // Create a public client for verification
    const publicClient = client.extend(publicActions);

    // Sign a message before deployment
    const message = "Sign before deployment with EIP-6492!";
    const signature = await account.signMessage({ message });

    // Verify the signature using viem's verifyMessage (which should support EIP-6492)
    const isValid = await publicClient.verifyMessage({
      address: account.address,
      message,
      signature,
    });

    expect(isValid).toBe(true);
  }, 60_000);
});
