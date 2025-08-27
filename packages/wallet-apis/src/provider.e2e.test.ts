import {
  createClient,
  createPublicClient,
  custom,
  zeroAddress,
  type Account,
  type Address,
  type Chain,
  type Client,
  type Transport,
} from "viem";
import { alchemyTransport, type AlchemyTransport } from "@alchemy/common";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrumSepolia } from "viem/chains";
import { createSmartWalletClient } from "./client.js";
import {
  getAddresses,
  getCallsStatus,
  getCapabilities,
  getChainId,
  sendCalls,
  sendTransaction,
  signMessage,
  signTypedData,
  waitForCallsStatus,
} from "viem/actions";

describe("Provider E2E Tests", async () => {
  let clientFromProvider: Client<Transport, Chain, Account>;
  let transport: AlchemyTransport;
  let account: Address;

  const publicClient = createPublicClient({
    chain: arbitrumSepolia,
    transport: alchemyTransport({
      apiKey: process.env.TEST_ALCHEMY_API_KEY!,
    }),
  });

  beforeAll(async () => {
    transport = alchemyTransport(
      process.env.ALCHEMY_PROXY_RPC_URL
        ? {
            url: process.env.ALCHEMY_PROXY_RPC_URL,
          }
        : {
            url: "https://api.g.alchemy.com/v2",
            apiKey: process.env.TEST_ALCHEMY_API_KEY!,
          },
    );

    const signer = privateKeyToAccount(
      "0xd7b061ef04d29cf68b3c89356678eccec9988de8d5ed892c19461c4a9d65925d",
    );

    const _client = createSmartWalletClient({
      transport,
      chain: arbitrumSepolia,
      signer,
      // TODO(v5): We can't test successful unsponsored UOs (unless we have
      // a funded test wallet) since these tests are using a real wallet
      // server instance instead of Anvil.
      policyId: process.env.TEST_PAYMASTER_POLICY_ID!,
    });

    const provider = _client.getProvider();

    await new Promise((resolve) => {
      provider.on("connect", (data) => {
        console.log("Connected with chainId:", data.chainId);
        resolve(data);
      });
    });

    [account] = await provider.request({
      method: "eth_accounts",
    });

    clientFromProvider = createClient({
      account,
      transport: custom(provider),
      chain: arbitrumSepolia,
    });
  });

  it("can correctly sign a message", async () => {
    const message = "hello world";
    const signature = await signMessage(clientFromProvider, {
      message,
    });
    const isValid = await publicClient.verifyMessage({
      address: clientFromProvider.account.address,
      message,
      signature,
    });
    expect(isValid).toBe(true);
  });

  it("can correctly sign typed data", async () => {
    const signature = await signTypedData(clientFromProvider, givenTypedData);
    const isValid = await publicClient.verifyTypedData({
      ...givenTypedData,
      signature,
      address: clientFromProvider.account.address,
    });
    expect(isValid).toBe(true);
  });

  it("returns the correct chain id", async () => {
    const chainId = await getChainId(clientFromProvider);
    expect(chainId).toBe(arbitrumSepolia.id);
  });

  it("returns the smart account address", async () => {
    const addresses = await getAddresses(clientFromProvider);
    expect(addresses).toEqual([account]);
  });

  it("can successfully use sendTransaction action", async () => {
    const hash = await sendTransaction(clientFromProvider, {
      to: zeroAddress,
      data: "0x",
      value: 0n,
    });
    await publicClient.waitForTransactionReceipt({ hash });
  });

  it("can successfully use sendCalls and waitForCallsStatus actions", async () => {
    const result = await sendCalls(clientFromProvider, {
      calls: [
        {
          to: zeroAddress,
          data: "0x",
          value: 0n,
        },
        {
          to: zeroAddress,
          data: "0x",
          value: 0n,
        },
      ],
    });
    await waitForCallsStatus(clientFromProvider, result);
  });

  it("can successfully use getCallsStatus action", async () => {
    const result = await sendCalls(clientFromProvider, {
      calls: [
        {
          to: zeroAddress,
          data: "0x",
          value: 0n,
        },
      ],
    });
    expect(result).toBeDefined();
    const { status } = await getCallsStatus(clientFromProvider, result);
    expect(status).toBe("pending");
  });

  it("can send a call using 7702", async () => {
    const signer7702 = privateKeyToAccount(
      "0x985fe592f94f96d2813ac3519b94a8ddd10cd25cf02d7b6b252588ce6b312dab",
    );
    const account = signer7702.address;

    const _client = createSmartWalletClient({
      transport,
      chain: arbitrumSepolia,
      signer: signer7702,
      policyId: process.env.TEST_PAYMASTER_POLICY_ID!,
      account,
    });

    const provider7702 = _client.getProvider();

    await new Promise((resolve) => {
      provider7702.on("connect", (data) => {
        console.log("Connected with chainId:", data.chainId);
        resolve(data);
      });
    });

    const [resolvedAccount] = await provider7702.request({
      method: "eth_accounts",
    });
    expect(resolvedAccount).toBe(account);

    const clientFromProvider7702 = createClient({
      account,
      transport: custom(provider7702),
      chain: arbitrumSepolia,
    });

    const result = await sendCalls(clientFromProvider7702, {
      calls: [
        {
          to: zeroAddress,
          data: "0x",
          value: 0n,
        },
      ],
    });
    await waitForCallsStatus(clientFromProvider7702, result);
  });

  it("can successfully use getCapabilities action", async () => {
    const capabilities = await getCapabilities(clientFromProvider);
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
