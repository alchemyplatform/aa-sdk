import { LocalAccountSigner } from "@aa-sdk/core";
import { alchemy, arbitrumSepolia } from "@account-kit/infra";
import { describe, expect, it } from "bun:test";
import { createPublicClient, zeroAddress, type Address, type Hex } from "viem";
import { createSmartWalletClient, type SmartWalletClient } from "./index.js";
import { sleep } from "bun";

describe("Client E2E Tests", () => {
  const transport = alchemy(
    process.env.ALCHEMY_PROXY_RPC_URL
      ? {
          rpcUrl: process.env.ALCHEMY_PROXY_RPC_URL,
        }
      : {
          apiKey: process.env.TEST_ALCHEMY_API_KEY!,
        },
  );

  const signer = LocalAccountSigner.privateKeyToAccountSigner(
    "0xd7b061ef04d29cf68b3c89356678eccec9988de8d5ed892c19461c4a9d65925d",
  );

  const client = createSmartWalletClient({
    transport,
    chain: arbitrumSepolia,
    signer,
  });

  const publicClient = createPublicClient({
    chain: arbitrumSepolia,
    transport,
  });

  it("should successfully get a counterfactual address", async () => {
    const account = await client.requestAccount();
    expect(account.address).toMatchInlineSnapshot(
      `"0x76E765e80FFAC96ac10Aa8908a8267A3B80d606D"`,
    );
  });

  it("should successfully request account with different salt", async () => {
    const account = await client.requestAccount({
      id: "26b375e3-c94a-4e98-b6b7-5a97121aa583",
      creationHint: { salt: "0x1" },
    });

    expect(account.address).toMatchInlineSnapshot(
      `"0xdfdd407b9569D40BEFa503208753E59cAc9713fA"`,
    );
  });

  it("should not cache account if different inputs provided", async () => {
    const account = await client.requestAccount();
    const account2 = await client.requestAccount({
      id: "2a3320b4-6ed2-4833-a488-5188e9bdd9d2",
      creationHint: { salt: "0x2" },
    });

    expect(account.address).not.toEqual(account2.address);
  });

  it("can correctly sign a message", async () => {
    const account = await client.requestAccount();
    const message = "hello world";
    const signature = await client.signMessage({ message });
    const isValid = await publicClient.verifyMessage({
      address: account.address,
      message: "hello world",
      signature,
    });
    expect(isValid).toBeTrue();
  });

  it("can correctly sign typed data", async () => {
    const account = await client.requestAccount();
    const signature = await client.signTypedData(givenTypedData);
    const isValid = await publicClient.verifyTypedData({
      ...givenTypedData,
      signature,
      address: account.address,
    });
    expect(isValid).toBeTrue();
  });

  it("can correctly sign a message with a different account", async () => {
    const account = await client.requestAccount({
      id: "26b375e3-c94a-4e98-b6b7-5a97121aa583",
      creationHint: { salt: "0x1" },
    });

    const message = "hello world";
    const signature = await client.signMessage({
      message,
      account: account.address,
    });
    const isValid = await publicClient.verifyMessage({
      address: account.address,
      message: "hello world",
      signature,
    });
    expect(isValid).toBeTrue();
  });

  it("can correctly sign typed data with a different account", async () => {
    const account = await client.requestAccount({
      id: "26b375e3-c94a-4e98-b6b7-5a97121aa583",
      creationHint: { salt: "0x1" },
    });

    const signature = await client.signTypedData({
      ...givenTypedData,
      account: account.address,
    });

    const isValid = await publicClient.verifyTypedData({
      ...givenTypedData,
      signature,
      address: account.address,
    });
    expect(isValid).toBeTrue();
  });

  it(
    "should successfully send a UO with paymaster",
    async () => {
      const account = await client.requestAccount();
      const preparedCalls = await client.prepareCalls({
        calls: [{ to: zeroAddress, value: "0x0" }],
        from: account.address,
        capabilities: {
          paymasterService: {
            policyId: process.env.TEST_PAYMASTER_POLICY_ID!,
          },
        },
      });

      const signedCalls = await client.signPreparedCalls(preparedCalls);

      const result = await client.sendPreparedCalls(signedCalls);

      expect(result.preparedCallIds).toBeArrayOfSize(1);

      await waitForUserOpSuccess(client, result.preparedCallIds[0]);
    },
    {
      timeout: 45_000,
    },
  );

  it(
    "should successfully drop and replace a UO with repeat calls",
    async () => {
      const account = await client.requestAccount();
      const preparedCalls = await client.prepareCalls({
        calls: [{ to: zeroAddress, value: "0x0" }],
        from: account.address,
        capabilities: {
          paymasterService: {
            policyId: process.env.TEST_PAYMASTER_POLICY_ID!,
          },
        },
      });

      const signedCalls = await client.signPreparedCalls(preparedCalls);
      const result = await client.sendPreparedCalls(signedCalls);

      expect(result.preparedCallIds).toBeArrayOfSize(1);

      await waitForUserOpSuccess(client, result.preparedCallIds[0]);

      const prepareCalls2 = await client.prepareCalls({
        calls: [{ to: zeroAddress, value: "0x0" }],
        from: account.address,
        capabilities: {
          paymasterService: {
            policyId: process.env.TEST_PAYMASTER_POLICY_ID!,
          },
        },
      });
      const signedCalls2 = await client.signPreparedCalls(prepareCalls2);
      const result2 = await client.sendPreparedCalls(signedCalls2);

      expect(result2.preparedCallIds).toBeArrayOfSize(1);

      await waitForUserOpSuccess(client, result2.preparedCallIds[0]);
    },
    {
      timeout: 90_000,
    },
  );

  it(
    "should successfully send a UO with paymaster using 7702",
    async () => {
      const _signer = LocalAccountSigner.privateKeyToAccountSigner(
        "0x00d35c6d307b5cddeb70aeed96ee27a551fee58bf1a43858477e6c11f9172ba8",
      );

      const _client = createSmartWalletClient({
        transport,
        chain: arbitrumSepolia,
        signer: _signer,
      });

      const account = await _client.requestAccount({
        creationHint: {
          accountType: "7702",
        },
      });
      expect(account.address).toBe(await _signer.getAddress());

      const preparedCalls = await _client.prepareCalls({
        calls: [{ to: zeroAddress, value: "0x0" }],
        from: account.address,
        capabilities: {
          paymasterService: {
            policyId: process.env.TEST_PAYMASTER_POLICY_ID!,
          },
        },
      });

      const signedCalls = await _client.signPreparedCalls(preparedCalls);

      const result = await _client.sendPreparedCalls(signedCalls);

      expect(result.preparedCallIds).toBeArrayOfSize(1);

      await waitForUserOpSuccess(client, result.preparedCallIds[0]);
    },
    { timeout: 45_000 },
  );

  it(
    "should successfully create a session with grantPermissions and send a UO",
    async () => {
      const account = await client.requestAccount();

      const sessionKey = LocalAccountSigner.generatePrivateKeySigner();

      const permissions = await client.grantPermissions({
        account: account.address,
        expirySec: Math.floor(Date.now() / 1000) + 60 * 60,
        key: {
          publicKey: await sessionKey.getAddress(),
          type: "secp256k1",
        },
        permissions: [{ type: "root" }],
      });

      const sessionKeyClient = createSmartWalletClient({
        transport,
        chain: arbitrumSepolia,
        signer: sessionKey,
      });

      const preparedCalls = await sessionKeyClient.prepareCalls({
        calls: [{ to: zeroAddress, value: "0x0" }],
        from: account.address,
        capabilities: {
          paymasterService: {
            policyId: process.env.TEST_PAYMASTER_POLICY_ID!,
          },
          permissions,
        },
      });

      const signedCalls =
        await sessionKeyClient.signPreparedCalls(preparedCalls);

      const result = await sessionKeyClient.sendPreparedCalls({
        ...signedCalls,
        capabilities: {
          permissions,
        },
      });

      expect(result.preparedCallIds).toBeArrayOfSize(1);

      await waitForUserOpSuccess(client, result.preparedCallIds[0]);
    },
    {
      timeout: 45_000,
    },
  );

  const givenTypedData = {
    types: {
      Person: [
        { name: "name", type: "string" },
        { name: "wallet", type: "address" },
      ],
      Mail: [
        { name: "from", type: "Person" },
        { name: "to", type: "Person" },
        { name: "contents", type: "string" },
      ],
    },
    primaryType: "Mail" as const,
    domain: {
      name: "Ether Mail",
      version: "1",
      chainId: 1,
      verifyingContract:
        "0xbbc68f94D29d52EE8D4994E54d6ED0fEAeb99C2c" as Address,
    },
    message: {
      from: {
        name: "Alice",
        wallet: "0xFC24e57486116026740634F629ffC4E5C95A6893",
      },
      to: {
        name: "Bob",
        wallet: "0xe7a26f006EAA562308C5df235C02BFB9a5849177",
      },
      contents: "Hello, Bob!",
    },
  } as const;
});

const waitForUserOpSuccess = async (
  client: SmartWalletClient,
  preparedCallId: Hex,
) => {
  const maxTimeoutMs = 1000 * 30;
  const deadline = Date.now() + maxTimeoutMs;
  while (Date.now() < deadline) {
    const status = (await client.getCallsStatus(preparedCallId)).status;
    if (status === 200) {
      // Success.
      return;
    }
    if (status !== 100) {
      // Error.
      throw new Error(`Get call status failed with status ${status}.`);
    }
    // Pending.
    await sleep(5000);
  }
  throw new Error("Timed out waiting for successful call status.");
};
