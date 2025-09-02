import { vi } from "vitest";
import {
  createPublicClient,
  zeroAddress,
  type Address,
  type WaitForCallsStatusReturnType,
} from "viem";
import type { PrepareCallsParams } from "./actions/prepareCalls.js";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { arbitrumSepolia } from "viem/chains";
import { createSmartWalletClient } from "./client.js";
import { apiTransport, publicTransport } from "./testSetup.js";

// We want to test both the "unroll each step" method and the full e2e "sendCalls" method.
const sendVariants: Array<
  (
    client: ReturnType<typeof createSmartWalletClient>,
    input: PrepareCallsParams,
    assertCallIdsSize?: number,
  ) => Promise<WaitForCallsStatusReturnType>
> = [
  // Send calls
  async (client, input, assertCallIdsSize) => {
    const result = await client.sendCalls(input);
    if (assertCallIdsSize != null) {
      expect(result.preparedCallIds).toHaveLength(assertCallIdsSize);
    }
    return client.waitForCallsStatus({ id: result.preparedCallIds[0] });
  },
  // Prepare, sign, send calls
  async (client, input, assertCallIdsSize) => {
    const preparedCalls = await client.prepareCalls(input);
    const signedCalls = await client.signPreparedCalls(preparedCalls);
    const result = await client.sendPreparedCalls({
      ...signedCalls,
      ...(input.capabilities?.permissions != null
        ? { capabilities: { permissions: input.capabilities.permissions } }
        : {}),
    });

    if (assertCallIdsSize != null) {
      expect(result.preparedCallIds).toHaveLength(assertCallIdsSize);
    }

    return client.waitForCallsStatus({ id: result.preparedCallIds[0] });
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
      account: account.address,
    });
    expect(capabilities).toMatchInlineSnapshot(`
      {
        "0": {
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
          "paymasterService": {
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
        },
      }
    `);
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
    expect(isValid).toBe(true);
  });

  it("can correctly sign typed data", async () => {
    const account = await client.requestAccount();
    const signature = await client.signTypedData(givenTypedData);
    const isValid = await publicClient.verifyTypedData({
      ...givenTypedData,
      signature,
      address: account.address,
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
      account: account.address,
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
      account: account.address,
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

      const result = await sendVariant(
        client,
        {
          calls: [{ to: zeroAddress, value: "0x0" }],
          from: account.address,
          capabilities: {
            paymasterService: {
              policyId: process.env.TEST_PAYMASTER_POLICY_ID!,
            },
          },
        },
        1,
      );

      expect(result.status).toBe("success");
    },
    {
      timeout: 45_000,
    },
  );

  it.each(sendVariants)(
    "should successfully drop and replace a UO with repeat calls",
    async (sendVariant) => {
      const account = await client.requestAccount();
      const result1 = await sendVariant(
        client,
        {
          calls: [{ to: zeroAddress, value: "0x0" }],
          from: account.address,
          capabilities: {
            paymasterService: {
              policyId: process.env.TEST_PAYMASTER_POLICY_ID!,
            },
          },
        },
        1,
      );

      expect(result1.status).toBe("success");

      const result2 = await sendVariant(
        client,
        {
          calls: [{ to: zeroAddress, value: "0x0" }],
          from: account.address,
          capabilities: {
            paymasterService: {
              policyId: process.env.TEST_PAYMASTER_POLICY_ID!,
            },
          },
        },
        1,
      );

      expect(result2.status).toBe("success");
    },
    {
      timeout: 90_000,
    },
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

      const result = await sendVariant(
        _client,
        {
          calls: [{ to: zeroAddress, value: "0x0" }],
          from: account.address,
          capabilities: {
            paymasterService: {
              policyId: process.env.TEST_PAYMASTER_POLICY_ID!,
            },
          },
        },
        1,
      );

      expect(result.status).toBe("success");
    },
    { timeout: 45_000 },
  );

  it.each(sendVariants)(
    "should successfully create a session with grantPermissions and send a UO",
    async (sendVariant) => {
      const account = await client.requestAccount();

      const sessionKey = privateKeyToAccount(generatePrivateKey());

      const permissions = await client.grantPermissions({
        account: account.address,
        expirySec: Math.floor(Date.now() / 1000) + 60 * 60,
        key: {
          publicKey: await sessionKey.address,
          type: "secp256k1",
        },
        permissions: [{ type: "root" }],
      });

      const sessionKeyClient = createSmartWalletClient({
        transport: apiTransport,
        chain: arbitrumSepolia,
        signer: sessionKey,
      });

      const result = await sendVariant(
        sessionKeyClient,
        {
          calls: [{ to: zeroAddress, value: "0x0" }],
          from: account.address,
          capabilities: {
            paymasterService: {
              policyId: process.env.TEST_PAYMASTER_POLICY_ID!,
            },
            permissions,
          },
        },
        1,
      );

      expect(result.status).toBe("success");
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
