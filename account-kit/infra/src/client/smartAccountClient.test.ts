import {
  LocalAccountSigner,
  type ClientMiddlewareFn,
  type SmartContractAccount,
} from "@aa-sdk/core";
import { createLightAccount } from "@account-kit/smart-contracts";
import { http, zeroAddress } from "viem";
import { generatePrivateKey } from "viem/accounts";
import { alchemy } from "../alchemyTransport.js";
import { sepolia } from "../chains.js";
import { createAlchemySmartAccountClient } from "./smartAccountClient.js";

const headerMatcher = {
  "Alchemy-AA-Sdk-Version": expect.any(String),
};

describe("AlchemySmartAccountClient tests", () => {
  let ogFetch = fetch;
  beforeAll(() => {
    global.fetch = vi.fn();
  });

  beforeEach(() => {
    // @ts-expect-error - fetch is mocked
    global.fetch.mockClear();
  });
  afterAll(() => {
    global.fetch = ogFetch;
  });

  it("should set the headers when using non-hoisted accounts", async () => {
    const client = givenClient();
    await client
      .request({ method: "eth_supportedEntryPoints", params: [] })
      .catch(() => {});
    expect(
      // @ts-expect-error - fetch is mocked
      fetch.mock.calls.map((x) => x[1].headers)[0]
    ).toMatchInlineSnapshot(
      headerMatcher,
      `
      {
        "Alchemy-AA-Sdk-Version": Any<String>,
        "Content-Type": "application/json",
      }
    `
    );

    await client.middleware
      // @ts-expect-error this is actually still there
      .customMiddleware(
        {},
        {
          account: await createLightAccount({
            chain: sepolia,
            transport: http(),
            signer: LocalAccountSigner.privateKeyToAccountSigner(
              generatePrivateKey()
            ),
            accountAddress: zeroAddress,
          }),
        }
      )
      .catch(() => {});

    // clear the mock calls so we only get the latest call below
    // @ts-expect-error - fetch is mocked
    global.fetch.mockClear();
    await client
      .request({ method: "eth_supportedEntryPoints", params: [] })
      .catch(() => {});

    expect(
      // @ts-expect-error - fetch is mocked
      fetch.mock.calls.map((x) => x[1].headers)[0]
    ).toMatchInlineSnapshot(
      headerMatcher,
      `
      {
        "Alchemy-AA-Sdk-Version": Any<String>,
        "Alchemy-Aa-Sdk-Signer": "local",
        "Content-Type": "application/json",
      }
    `
    );
  });

  it("should set the headers when using hoisted accounts", async () => {
    const client = givenClient({
      account: await createLightAccount({
        chain: sepolia,
        transport: http(),
        signer: LocalAccountSigner.privateKeyToAccountSigner(
          generatePrivateKey()
        ),
        accountAddress: zeroAddress,
      }),
    });

    await client
      .request({ method: "eth_supportedEntryPoints", params: [] })
      .catch(() => {});

    expect(
      // @ts-expect-error - fetch is mocked
      fetch.mock.calls.map((x) => x[1].headers)[0]
    ).toMatchInlineSnapshot(
      headerMatcher,
      `
      {
        "Alchemy-AA-Sdk-Version": Any<String>,
        "Alchemy-Aa-Sdk-Signer": "local",
        "Content-Type": "application/json",
      }
    `
    );
  });

  it("should still use customMiddleware if it is passed in", async () => {
    const client = givenClient({
      customMiddleware: async (struct) => {
        return {
          ...struct,
          callGasLimit: "0xdeadbeef",
        };
      },
    });

    expect(
      // @ts-expect-error - this is available but not typed as public
      await client.middleware.customMiddleware(
        {},
        {
          account: await createLightAccount({
            chain: sepolia,
            transport: http(),
            signer: LocalAccountSigner.privateKeyToAccountSigner(
              generatePrivateKey()
            ),
            accountAddress: zeroAddress,
          }),
        }
      )
    ).toMatchInlineSnapshot(`
      {
        "callGasLimit": "0xdeadbeef",
      }
    `);

    await client
      .request({ method: "eth_supportedEntryPoints", params: [] })
      .catch(() => {});

    expect(
      // @ts-expect-error - fetch is mocked
      fetch.mock.calls.map((x) => x[1].headers)[0]
    ).toMatchInlineSnapshot(
      headerMatcher,
      `
      {
        "Alchemy-AA-Sdk-Version": Any<String>,
        "Alchemy-Aa-Sdk-Signer": "local",
        "Content-Type": "application/json",
      }
    `
    );
  });

  const givenClient = ({
    account,
    customMiddleware,
  }: {
    account?: SmartContractAccount;
    customMiddleware?: ClientMiddlewareFn;
  } = {}) => {
    return createAlchemySmartAccountClient({
      transport: alchemy({
        rpcUrl: "https://localhost:3000",
        retryCount: 0,
      }),
      chain: sepolia,
      account,
      customMiddleware,
    });
  };
});
