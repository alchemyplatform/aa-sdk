import {
  toCoinbaseSmartAccount,
  createBundlerClient,
  bundlerActions,
  createPaymasterClient,
} from "viem/account-abstraction";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { getBlockNumber, setBalance } from "viem/actions";
import { parseEther, custom, publicActions, zeroAddress } from "viem";
import { describe, it, expect, beforeAll } from "vitest";
import { local060Instance } from "~test/instances.js";
import { estimateFeesPerGas } from "@alchemy/aa-infra";

describe("Viem AA - Coinbase Smart Account", () => {
  let client: ReturnType<typeof local060Instance.getClient>; // TODO(jh): need to test EP 0.6.0 vs 7.0.0 w/ paymaster

  beforeAll(async () => {
    client = local060Instance.getClient();
    const blockNumber = await getBlockNumber(client);
    expect(blockNumber).toBeGreaterThan(0n);
  }, 30_000);

  it("should create a Coinbase smart account successfully", async () => {
    const owner = privateKeyToAccount(generatePrivateKey());

    const account = await toCoinbaseSmartAccount({
      client,
      owners: [owner],
      version: "1",
    });

    expect(account).toBeDefined();
    expect(account.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
    expect(account.type).toBe("smart");
  });

  it(
    "should send a user operation using paymaster",
    { retry: 3, timeout: 60_000 },
    async () => {
      const owner = privateKeyToAccount(generatePrivateKey());

      const account = await toCoinbaseSmartAccount({
        client,
        owners: [owner],
        version: "1",
      });

      const paymasterClient = createPaymasterClient({
        transport: custom(client),
      });

      const bundlerClient = createBundlerClient({
        account,
        chain: local060Instance.chain,
        transport: custom(client),
        paymaster: paymasterClient,
        paymasterContext: {
          policyId: "test-policy", // TODO(jh): will this work ok w/ our test instance setup?
        },
        userOperation: {
          estimateFeesPerGas,
        },
      });

      // Send the user operation
      const userOpHash = await bundlerClient.sendUserOperation({
        account,
        calls: [
          {
            to: zeroAddress,
            value: 0n,
            data: "0x",
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

      // Account should be deployed after the first user operation
      expect(await account.isDeployed()).toBe(true);
    },
  );

  it(
    "should verify signature using EIP-1271 after deployment",
    { retry: 3, timeout: 60_000 },
    async () => {
      const owner = privateKeyToAccount(generatePrivateKey());

      const account = await toCoinbaseSmartAccount({
        client,
        owners: [owner],
        version: "1",
      });

      const bundlerClient = createBundlerClient({
        account,
        chain: local060Instance.chain,
        transport: custom(client),
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
    },
  );

  it(
    "should verify EIP-6492 signatures for pre-deployed accounts",
    { retry: 3, timeout: 60_000 },
    async () => {
      const owner = privateKeyToAccount(generatePrivateKey());

      const account = await toCoinbaseSmartAccount({
        client,
        owners: [owner],
        version: "1",
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
    },
  );
});
