import {
  toSoladySmartAccount,
  createBundlerClient,
  bundlerActions,
  type SmartAccount,
} from "viem/account-abstraction";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { getBlockNumber, setBalance, getBalance } from "viem/actions";
import { parseEther, verifyMessage, custom, publicActions } from "viem";
import { describe, it, expect, beforeAll } from "vitest";
import { local070Instance } from "../../../../../.vitest/src/instances";

describe("Viem AA - Solady Smart Account", () => {
  let client: ReturnType<typeof local070Instance.getClient>;

  beforeAll(async () => {
    client = local070Instance.getClient();
    // Ensure infrastructure is ready
    const blockNumber = await getBlockNumber(client);
    expect(blockNumber).toBeGreaterThan(0n);
  }, 30_000);

  it("should create a Solady smart account successfully", async () => {
    const owner = privateKeyToAccount(generatePrivateKey());

    const account = await toSoladySmartAccount({
      client,
      owner,
    });

    expect(account).toBeDefined();
    expect(account.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
    expect(account.factory).toBeDefined();
    expect(account.factory.address).toBe(
      "0x5d82735936c6Cd5DE57cC3c1A799f6B2E6F933Df",
    );
  });

  it("should sign a message with Solady smart account and verify signature", async () => {
    const owner = privateKeyToAccount(generatePrivateKey());

    const account = await toSoladySmartAccount({
      client,
      owner,
    });

    const message = "Hello from Viem AA with Solady!";
    const signature = await account.signMessage({
      message,
    });

    expect(signature).toBeDefined();
    expect(signature).toMatch(/^0x[a-fA-F0-9]+$/);

    // Verify the signature using publicClient
    const publicClient = client.extend(publicActions);
    const isValid = await publicClient.verifyMessage({
      address: account.address,
      message,
      signature,
    });

    expect(isValid).toBe(true);
  }, 30_000);

  it("should create a bundler client with Solady account", async () => {
    const owner = privateKeyToAccount(generatePrivateKey());

    const account = await toSoladySmartAccount({
      client,
      owner,
    });

    const bundlerClient = createBundlerClient({
      account,
      chain: local070Instance.chain,
      transport: custom(client),
    });

    await setBalance(client, {
      address: account.address,
      value: parseEther("1.0"),
    });

    expect(bundlerClient).toBeDefined();
    expect(bundlerClient.account).toBe(account);
    // Account should NOT be deployed yet
    expect(await account.isDeployed()).toBe(false);
  }, 30_000);

  it.skip("should send a simple ETH transfer user operation", async () => {
    const owner = privateKeyToAccount(generatePrivateKey());

    const account = await toSoladySmartAccount({
      client,
      owner,
    });

    const bundlerClient = createBundlerClient({
      account,
      chain: local070Instance.chain,
      transport: custom(client),
    });

    await setBalance(client, {
      address: account.address,
      value: parseEther("2.0"),
    });

    const recipient = "0x000000000000000000000000000000000000dEaD";
    const amount = parseEther("0.1");

    const initialBalance = await getBalance(client, {
      address: recipient,
    });

    // Send the transfer - account will be deployed automatically
    const userOpHash = await bundlerClient.sendUserOperation({
      calls: [
        {
          to: recipient,
          value: amount,
          data: "0x",
        },
      ],
    });

    const receipt = await bundlerClient.waitForUserOperationReceipt({
      hash: userOpHash,
    });

    expect(receipt).toBeDefined();
    expect(receipt.success).toBe(true);

    const finalBalance = await getBalance(client, {
      address: recipient,
    });

    expect(finalBalance).toBe(initialBalance + amount);
    
    // Account should be deployed after the first UO
    expect(await account.isDeployed()).toBe(true);
  }, 60_000);

  it("should demonstrate the complete viem AA framework setup", async () => {
    const owner = privateKeyToAccount(generatePrivateKey());

    const account = await toSoladySmartAccount({
      client,
      owner,
    });

    expect(account.address).toBeDefined();
    expect(account.type).toBe("smart");
    expect(account.factory.address).toBe(
      "0x5d82735936c6Cd5DE57cC3c1A799f6B2E6F933Df",
    );
  });
}); 