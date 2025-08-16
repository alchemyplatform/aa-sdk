import {
  createClient,
  createPublicClient,
  custom,
  hashMessage,
  type Address,
} from "viem";
import { alchemy } from "@alchemy/common";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrumSepolia } from "@account-kit/infra";
import { createSmartWalletClient } from "./client.js";
import { signMessage, signTypedData } from "viem/actions";

describe("Provider E2E Tests", () => {
  const transport = alchemy(
    process.env.ALCHEMY_PROXY_RPC_URL
      ? {
          proxyUrl: process.env.ALCHEMY_PROXY_RPC_URL,
        }
      : {
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
    account: "0x76E765e80FFAC96ac10Aa8908a8267A3B80d606D",
  });

  const provider = _client.getProvider();

  const clientFromProvider = createClient({
    account: _client.account,
    transport: custom(provider),
  });

  const publicClient = createPublicClient({
    chain: arbitrumSepolia,
    transport,
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

  // TODO(jh): eth_chainId

  // TODO(jh): eth_accounts

  // TODO(jh): eth_sendTransaction (w/ or w/o paymaster, normal or 7702)

  // TODO(jh): wallet_sendCalls (w/ or w/o paymaster, normal or 7702)

  // TODO(jh): wallet_getCallsStatus

  // TODO(jh): wallet_waitForCallsStatus

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
