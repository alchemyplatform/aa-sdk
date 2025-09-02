import {
  toCoinbaseSmartAccount,
  createBundlerClient,
  bundlerActions,
} from "viem/account-abstraction";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

import { getBlockNumber, setBalance, getBalance } from "viem/actions";
import { parseEther, custom, publicActions } from "viem";
import { describe, it, expect, beforeAll } from "vitest";
import { local070Instance } from "~test/instances.js";
import { alchemyGasManagerHooks } from "@alchemy/aa-infra";

describe("Viem AA - Coinbase Smart Account", () => {
  // Using 'any' type because local070Instance.getClient() returns a client with custom extensions
  // (mode: "anvil") that aren't part of standard viem types. This is test infrastructure only.
  let client: any;

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

    // Create a bundler client using Alchemy gas manager hooks with test client
    const bundlerClient = createBundlerClient({
      account,
      chain: local070Instance.chain,
      transport: custom(client),
      ...alchemyGasManagerHooks("test-policy", { client }),
    });

    // Fund the account
    await setBalance(client, {
      address: account.address,
      value: parseEther("2.0"),
    });

    const recipient =
      "0x000000000000000000000000000000000000dEaD" as `0x${string}`;
    const amount = parseEther("0.1");

    const initialBalance = await getBalance(client, {
      address: recipient,
    });

    // Prepare the user operation to verify paymaster fields
    const userOp = await bundlerClient.prepareUserOperation({
      account,
      calls: [
        {
          to: recipient,
          value: amount,
          data: "0x" as `0x${string}`,
        },
      ],
    });

    // Verify that paymaster fields are filled by the gas manager hooks
    // Coinbase accounts use v0.6 with paymasterAndData field
    expect(userOp.paymasterAndData).toBeDefined();
    expect(userOp.paymasterAndData).not.toBe("0x");
    // Should contain paymaster address (20 bytes) + data
    expect(userOp.paymasterAndData.length).toBeGreaterThan(42); // 0x + 40 hex chars for address

    // Send the user operation
    const userOpHash = await bundlerClient.sendUserOperation({
      account,
      calls: [
        {
          to: recipient,
          value: amount,
          data: "0x" as `0x${string}`,
        },
      ],
    });

    expect(userOpHash).toBeDefined();
    expect(userOpHash).toMatch(/^0x[a-fA-F0-9]{64}$/);

    // Wait for the user operation to be included
    const receipt = await bundlerClient.waitForUserOperationReceipt({
      hash: userOpHash,
      timeout: 120_000,
    });

    expect(receipt).toBeDefined();
    expect(receipt.success).toBe(true);

    const finalBalance = await getBalance(client, {
      address: recipient,
    });

    expect(finalBalance).toBe(initialBalance + amount);

    // Account should be deployed after the first user operation
    expect(await account.isDeployed()).toBe(true);
  }, 120_000);

  it("should verify signature using EIP-1271 after deployment", async () => {
    const owner = privateKeyToAccount(generatePrivateKey());

    const account = await toCoinbaseSmartAccount({
      client,
      owners: [owner],
    });

    // Create a bundler client using Alchemy gas manager hooks with test client
    const bundlerClient = createBundlerClient({
      account,
      chain: local070Instance.chain,
      transport: custom(client),
      ...alchemyGasManagerHooks("test-policy", { client }),
    }).extend(bundlerActions);

    // Fund and deploy the account
    await setBalance(client, {
      address: account.address,
      value: parseEther("1.0"),
    });

    // Prepare deployment operation to verify paymaster fields
    const deployOp = await bundlerClient.prepareUserOperation({
      account,
      calls: [
        {
          to: account.address,
          value: 0n,
          data: "0x" as `0x${string}`,
        },
      ],
    });

    // Verify that paymaster fields are filled by the gas manager hooks
    // Coinbase accounts use v0.6 with paymasterAndData field
    expect(deployOp.paymasterAndData).toBeDefined();
    expect(deployOp.paymasterAndData).not.toBe("0x");
    // Should contain paymaster address (20 bytes) + data
    expect(deployOp.paymasterAndData.length).toBeGreaterThan(42); // 0x + 40 hex chars for address

    // Deploy by sending a simple transaction to self
    const deployHash = await bundlerClient.sendUserOperation({
      account,
      calls: [
        {
          to: account.address,
          value: 0n,
          data: "0x" as `0x${string}`,
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

  it("should send transactions with ERC-20 token gas payment", async () => {
    const owner = privateKeyToAccount(generatePrivateKey());
    const account = await toCoinbaseSmartAccount({
      client,
      owners: [owner],
    });

    // Create a bundler client using Alchemy gas manager hooks with ERC-20 token payment
    const bundlerClient = createBundlerClient({
      account,
      chain: local070Instance.chain,
      transport: custom(client),
      ...alchemyGasManagerHooks("test-policy", { 
        client,
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC address
        maxTokenAmount: 10_000_000n, // 10 USDC
      }),
    });

    // Fund the account
    await setBalance(client, {
      address: account.address,
      value: parseEther("10"),
    });

    // Get a user operation to check the paymaster details
    const userOp = await bundlerClient.prepareUserOperation({
      account,
      calls: [
        {
          to: account.address,
          value: 0n,
          data: "0x" as `0x${string}`,
        },
      ],
    });

    // Verify that paymaster fields are filled by the gas manager hooks
    // Coinbase accounts use v0.6 with paymasterAndData field
    expect(userOp.paymasterAndData).toBeDefined();
    expect(userOp.paymasterAndData).not.toBe("0x");
    // Should contain paymaster address (20 bytes) + data
    expect(userOp.paymasterAndData.length).toBeGreaterThan(42); // 0x + 40 hex chars for address

    // Send a transaction to self
    const hash = await bundlerClient.sendUserOperation({
      account,
      calls: [
        {
          to: account.address,
          value: 0n,
          data: "0x" as `0x${string}`,
        },
      ],
    });

    const receipt = await bundlerClient.waitForUserOperationReceipt({
      hash,
    });

    expect(receipt.success).toBe(true);
    expect(receipt.userOpHash).toBe(hash);
  });
});
