import { vi } from "vitest";
import {
  createPublicClient,
  zeroAddress,
  type Address,
  type WaitForCallsStatusReturnType,
} from "viem";
import type { UserOperation } from "viem/account-abstraction";
import {
  getCallsStatus,
  getCapabilities,
  sendCalls,
  signMessage,
  signTypedData,
  waitForCallsStatus,
} from "viem/actions";
import type { SendCallsParams } from "./actions/sendCalls.js";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { arbitrumSepolia } from "viem/chains";
import { createSmartWalletClient } from "./client.js";
import { apiTransport, publicTransport } from "./__tests__/setup.js";
import { getAction } from "viem/utils";

// We want to test both the "unroll each step" method and the full e2e "sendCalls" method.
const sendVariants: Array<
  (
    client: ReturnType<typeof createSmartWalletClient>,
    input: SendCallsParams,
  ) => Promise<WaitForCallsStatusReturnType>
> = [
  // Send calls
  async (client, input) => {
    const result = await client.sendCalls(input);
    expect(result.id).toBeDefined();
    return client.waitForCallsStatus({ id: result.id });
  },
  // Prepare, sign, send calls
  async (client, input) => {
    const preparedCalls = await client.prepareCalls(input);
    const signedCalls = await client.signPreparedCalls(preparedCalls);
    const result = await client.sendPreparedCalls({
      ...signedCalls,
      ...(input.capabilities?.permissions != null
        ? { capabilities: { permissions: input.capabilities.permissions } }
        : {}),
    });

    expect(result.id).toBeDefined();

    return client.waitForCallsStatus({ id: result.id });
  },
];

describe("Client E2E Tests", () => {
  const signer = privateKeyToAccount(
    "0xd7b061ef04d29cf68b3c89356678eccec9988de8d5ed892c19461c4a9d65925d",
  );

  const client = createSmartWalletClient({
    transport: apiTransport,
    chain: arbitrumSepolia,
    signer,
  });
  const publicClient = createPublicClient({
    chain: arbitrumSepolia,
    transport: publicTransport,
  });

  it("should successfully get & caches a counterfactual address", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const account = await client.requestAccount();
    expect(account.address).toMatchInlineSnapshot(
      `"0x76E765e80FFAC96ac10Aa8908a8267A3B80d606D"`,
    );

    const accountAgain = await client.requestAccount();
    expect(accountAgain).toEqual(account);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    fetchSpy.mockRestore();
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

  it("should successfully get capabilities", async () => {
    const account = await client.requestAccount(); // Ensure account is known
    const capabilities = await client.getCapabilities({
      account,
    });
    expect(capabilities).toMatchInlineSnapshot(`
      {
        "atomic": {
          "status": "supported",
        },
        "eip7702Auth": {
          "supported": true,
        },
        "gasParamsOverride": {
          "supported": true,
        },
        "nonceOverride": {
          "supported": true,
        },
        "paymaster": {
          "supported": true,
        },
        "permissions": {
          "keyTypes": [
            "secp256k1",
          ],
          "permissionTypes": [
            "native-token-transfer",
            "erc20-token-transfer",
            "gas-limit",
            "contract-access",
            "account-functions",
            "functions-on-all-contracts",
            "functions-on-contract",
            "root",
          ],
          "signerTypes": [
            "keys",
          ],
          "supported": true,
        },
      }
    `);
  });

  it("can correctly sign a message using sma-b account", async () => {
    const account = await client.requestAccount();
    const message = "hello world";
    const signature = await client.signMessage({
      message,
      account,
    });
    const isValid = await publicClient.verifyMessage({
      address: account.address,
      message: "hello world",
      signature,
    });
    expect(isValid).toBe(true);
  });

  it("can correctly sign a message using default 7702 account", async () => {
    const message = "hello world";
    const signature = await client.signMessage({
      message,
    });
    const isValid = await publicClient.verifyMessage({
      address: client.account.address,
      message: "hello world",
      signature,
    });
    expect(isValid).toBe(true);
  });

  it("can correctly sign typed data using sma-b account", async () => {
    const account = await client.requestAccount();
    const signature = await client.signTypedData({
      ...givenTypedData,
      account,
    });
    const isValid = await publicClient.verifyTypedData({
      ...givenTypedData,
      signature,
      address: account.address,
    });
    expect(isValid).toBe(true);
  });

  it("can correctly sign typed data using default 7702 account", async () => {
    const signature = await client.signTypedData(givenTypedData);
    const isValid = await publicClient.verifyTypedData({
      ...givenTypedData,
      signature,
      address: client.account.address,
    });
    expect(isValid).toBe(true);
  });

  it("can correctly sign a message with a different account", async () => {
    const account = await client.requestAccount({
      id: "26b375e3-c94a-4e98-b6b7-5a97121aa583",
      creationHint: { salt: "0x1" },
    });

    const message = "hello world";
    const signature = await client.signMessage({
      message,
      account,
    });
    const isValid = await publicClient.verifyMessage({
      address: account.address,
      message: "hello world",
      signature,
    });
    expect(isValid).toBe(true);
  });

  it("can correctly sign typed data with a different account", async () => {
    const account = await client.requestAccount({
      id: "26b375e3-c94a-4e98-b6b7-5a97121aa583",
      creationHint: { salt: "0x1" },
    });

    const signature = await client.signTypedData({
      ...givenTypedData,
      account,
    });

    const isValid = await publicClient.verifyTypedData({
      ...givenTypedData,
      signature,
      address: account.address,
    });
    expect(isValid).toBe(true);
  });

  it.each(sendVariants)(
    "should successfully send a UO with paymaster",
    async (sendVariant) => {
      const account = await client.requestAccount();

      const result = await sendVariant(client, {
        calls: [{ to: zeroAddress, value: 0n }],
        account,
        capabilities: {
          paymaster: {
            policyId: process.env.TEST_PAYMASTER_POLICY_ID!,
          },
        },
      });

      expect(result.status).toBe("success");
    },
    60_000,
  );

  it.each(sendVariants)(
    "should successfully drop and replace a UO with repeat calls",
    async (sendVariant) => {
      const account = await client.requestAccount();
      const result1 = await sendVariant(client, {
        calls: [{ to: zeroAddress, value: 0n }],
        account,
        capabilities: {
          paymaster: {
            policyId: process.env.TEST_PAYMASTER_POLICY_ID!,
          },
        },
      });

      expect(result1.status).toBe("success");

      const result2 = await sendVariant(client, {
        calls: [{ to: zeroAddress, value: 0n }],
        account,
        capabilities: {
          paymaster: {
            policyId: process.env.TEST_PAYMASTER_POLICY_ID!,
          },
        },
      });

      expect(result2.status).toBe("success");
    },
    90_000,
  );

  it.each(sendVariants)(
    "should successfully send a UO with paymaster using 7702",
    async (sendVariant) => {
      const _signer = privateKeyToAccount(
        "0x00d35c6d307b5cddeb70aeed96ee27a551fee58bf1a43858477e6c11f9172ba8",
      );

      const _client = createSmartWalletClient({
        transport: apiTransport,
        chain: arbitrumSepolia,
        signer: _signer,
      });

      const account = await _client.requestAccount({
        creationHint: {
          accountType: "7702",
        },
      });
      expect(account.address).toBe(_signer.address);

      const result = await sendVariant(_client, {
        calls: [{ to: zeroAddress, value: 0n }],
        account,
        capabilities: {
          paymaster: {
            policyId: process.env.TEST_PAYMASTER_POLICY_ID!,
          },
        },
      });

      expect(result.status).toBe("success");
    },
    60_000,
  );

  it.each(sendVariants)(
    "should successfully create a session with grantPermissions and send a UO",
    async (sendVariant) => {
      const account = await client.requestAccount();

      const sessionKey = privateKeyToAccount(generatePrivateKey());

      const permissions = await client.grantPermissions({
        account,
        expirySec: Math.floor(Date.now() / 1000) + 60 * 60,
        key: {
          publicKey: sessionKey.address,
          type: "secp256k1",
        },
        permissions: [{ type: "root" }],
      });

      const sessionKeyClient = createSmartWalletClient({
        transport: apiTransport,
        chain: arbitrumSepolia,
        signer: sessionKey,
      });

      const result = await sendVariant(sessionKeyClient, {
        calls: [{ to: zeroAddress, value: 0n }],
        account,
        capabilities: {
          paymaster: {
            policyId: process.env.TEST_PAYMASTER_POLICY_ID!,
          },
          permissions,
        },
      });

      expect(result.status).toBe("success");
    },
    60_000,
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

  describe("viem action compatibility", () => {
    it("can use viem's sendCalls and waitForCallsStatus actions via getAction", async () => {
      const account = await client.requestAccount();

      const { id: callId } = await getAction(
        client,
        sendCalls,
        "sendCalls",
      )({
        calls: [{ to: zeroAddress, value: 0n }],
        account,
        capabilities: {
          paymaster: { policyId: process.env.TEST_PAYMASTER_POLICY_ID! },
        },
      });

      expect(callId).toBeDefined();
      expect(typeof callId).toBe("string");

      const result = await getAction(
        client,
        waitForCallsStatus,
        "waitForCallsStatus",
      )({ id: callId });
      expect(result.status).toBe("success");
    }, 60_000);

    it("can use viem's signMessage action via getAction", async () => {
      const account = await client.requestAccount();
      const message = "hello from viem action";

      const signature = await getAction(
        client,
        signMessage,
        "signMessage",
      )({
        message,
        account,
      });

      const isValid = await publicClient.verifyMessage({
        address: account.address,
        message,
        signature,
      });
      expect(isValid).toBe(true);
    });

    it("can use viem's signTypedData action via getAction", async () => {
      const account = await client.requestAccount();

      const signature = await getAction(
        client,
        signTypedData,
        "signTypedData",
      )({
        ...givenTypedData,
        account,
      });

      const isValid = await publicClient.verifyTypedData({
        ...givenTypedData,
        signature,
        address: account.address,
      });
      expect(isValid).toBe(true);
    });

    it("can use viem's getCapabilities action via getAction", async () => {
      const account = await client.requestAccount();

      const capabilities = await getAction(
        client,
        getCapabilities,
        "getCapabilities",
      )({ account });

      expect(capabilities).toMatchInlineSnapshot(`
        {
          "atomic": {
            "status": "supported",
          },
          "eip7702Auth": {
            "supported": true,
          },
          "gasParamsOverride": {
            "supported": true,
          },
          "nonceOverride": {
            "supported": true,
          },
          "paymaster": {
            "supported": true,
          },
          "permissions": {
            "keyTypes": [
              "secp256k1",
            ],
            "permissionTypes": [
              "native-token-transfer",
              "erc20-token-transfer",
              "gas-limit",
              "contract-access",
              "account-functions",
              "functions-on-all-contracts",
              "functions-on-contract",
              "root",
            ],
            "signerTypes": [
              "keys",
            ],
            "supported": true,
          },
        }
      `);
    });

    it("prepareCalls returns a UO satisfying viem's UserOperation type", async () => {
      const account = await client.requestAccount();

      const preparedCalls = await client.prepareCalls({
        calls: [{ to: zeroAddress, value: 0n }],
        account,
        capabilities: {
          paymaster: { policyId: process.env.TEST_PAYMASTER_POLICY_ID! },
        },
      });

      expect(preparedCalls.type).toMatch(/^user-operation-v0(60|70)$/);

      // Compile-time type check: prepared UO data + dummy signature is assignable to viem's UserOperation
      if (preparedCalls.type === "user-operation-v060") {
        const _uo: UserOperation<"0.6"> = {
          ...preparedCalls.data,
          signature: "0x",
        };
        expect(typeof _uo.sender).toBe("string");
        expect(typeof _uo.nonce).toBe("bigint");
        expect(typeof _uo.callGasLimit).toBe("bigint");
      } else if (preparedCalls.type === "user-operation-v070") {
        const _uo: UserOperation<"0.7"> = {
          ...preparedCalls.data,
          signature: "0x",
        };
        expect(typeof _uo.sender).toBe("string");
        expect(typeof _uo.nonce).toBe("bigint");
        expect(typeof _uo.callGasLimit).toBe("bigint");
      }
    });

    it("sendPreparedCalls sends a UO satisfying viem's UserOperation type", async () => {
      const account = await client.requestAccount();

      const preparedCalls = await client.prepareCalls({
        calls: [{ to: zeroAddress, value: 0n }],
        account,
        capabilities: {
          paymaster: { policyId: process.env.TEST_PAYMASTER_POLICY_ID! },
        },
      });

      const signedCalls = await client.signPreparedCalls(preparedCalls);

      expect(signedCalls.type).toMatch(/^user-operation-v0(60|70)$/);

      // Compile-time type check: signed UO data is assignable to viem's UserOperation.
      // No manual narrowing needed — SignPreparedCallsResult guarantees secp256k1 hex signature.
      if (signedCalls.type === "user-operation-v060") {
        const _uo: UserOperation<"0.6"> = {
          ...signedCalls.data,
          signature: signedCalls.signature.data,
        };
        expect(_uo.signature).toMatch(/^0x/);
        expect(_uo.signature.length).toBeGreaterThan(2);
      } else if (signedCalls.type === "user-operation-v070") {
        const _uo: UserOperation<"0.7"> = {
          ...signedCalls.data,
          signature: signedCalls.signature.data,
        };
        expect(_uo.signature).toMatch(/^0x/);
        expect(_uo.signature.length).toBeGreaterThan(2);
      }

      const result = await client.sendPreparedCalls(signedCalls);
      expect(result.id).toBeDefined();

      const status = await client.waitForCallsStatus({ id: result.id });
      expect(status.status).toBe("success");
    }, 60_000);

    it("can use viem's getCallsStatus action via getAction", async () => {
      const account = await client.requestAccount();

      const { id: callId } = await getAction(
        client,
        sendCalls,
        "sendCalls",
      )({
        calls: [{ to: zeroAddress, value: 0n }],
        account,
        capabilities: {
          paymaster: { policyId: process.env.TEST_PAYMASTER_POLICY_ID! },
        },
      });

      // Check status immediately after sending — should be pending or already confirmed
      const initialResult = await getAction(
        client,
        getCallsStatus,
        "getCallsStatus",
      )({ id: callId });
      expect(initialResult.status).toMatch(/^(pending|confirmed|success)$/);

      // Wait for confirmation
      await getAction(
        client,
        waitForCallsStatus,
        "waitForCallsStatus",
      )({ id: callId });

      // After waiting, status should be success
      const finalResult = await getAction(
        client,
        getCallsStatus,
        "getCallsStatus",
      )({ id: callId });
      expect(finalResult.status).toBe("success");
      expect(finalResult.receipts).toBeDefined();
    }, 60_000);
  });
});
