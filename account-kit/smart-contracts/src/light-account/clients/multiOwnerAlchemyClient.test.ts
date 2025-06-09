import * as AACoreModule from "@aa-sdk/core";
import {
  LocalAccountSigner,
  type BatchUserOperationCallData,
  type SmartAccountSigner,
} from "@aa-sdk/core";
import {
  alchemy,
  alchemyEnhancedApiActions,
  arbitrumSepolia,
  createAlchemySmartAccountClient,
} from "@account-kit/infra";
import { Alchemy, Network } from "alchemy-sdk";
import { avalanche, type Chain } from "viem/chains";
import { createMultiOwnerLightAccountClient } from "./multiOwnerLightAccount.js";

describe("MultiOwnerLightAccount Client Tests", () => {
  const dummyMnemonic =
    "test test test test test test test test test test test test";
  const signer = LocalAccountSigner.mnemonicToAccountSigner(dummyMnemonic);
  const chain = arbitrumSepolia;

  it("should have a JWT property", async () => {
    const spy = vi.spyOn(AACoreModule, "createBundlerClient");
    await givenConnectedProvider({ signer, chain });
    expect(spy.mock.results[0].value.transport).toMatchInlineSnapshot(
      {
        alchemyRpcUrl: "https://arb-sepolia.g.alchemy.com/v2",
        fetchOptions: {
          headers: {
            "Alchemy-AA-Sdk-Version": expect.any(String),
            "Alchemy-Aa-Sdk-Signer": "local",
            Authorization: "Bearer test",
          },
        },
        key: "alchemy",
        methods: undefined,
        name: "Alchemy Transport",
        request: expect.any(Function),
        retryCount: 0,
        retryDelay: 150,
        timeout: undefined,
        type: "alchemy",
      },
      `
      {
        "alchemyRpcUrl": "https://arb-sepolia.g.alchemy.com/v2",
        "fetchOptions": {
          "headers": {
            "Alchemy-AA-Sdk-Version": Any<String>,
            "Alchemy-Aa-Sdk-Signer": "local",
            "Authorization": "Bearer test",
          },
        },
        "key": "alchemy",
        "methods": undefined,
        "name": "Alchemy Transport",
        "request": Any<Function>,
        "retryCount": 0,
        "retryDelay": 150,
        "timeout": undefined,
        "type": "alchemy",
      }
    `,
    );
  });

  it("should correctly encode batch transaction data", async () => {
    const provider = await givenConnectedProvider({ signer, chain });
    const account = provider.account;
    const data = [
      {
        target: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
        data: "0xdeadbeef",
      },
      {
        target: "0x8ba1f109551bd432803012645ac136ddd64dba72",
        data: "0xcafebabe",
      },
    ] satisfies BatchUserOperationCallData;

    expect(await account.encodeBatchExecute(data)).toMatchInlineSnapshot(
      '"0x47e1da2a000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000deadbeefdeadbeefdeadbeefdeadbeefdeadbeef0000000000000000000000008ba1f109551bd432803012645ac136ddd64dba720000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000004deadbeef000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004cafebabe00000000000000000000000000000000000000000000000000000000"',
    );
  });

  it.each([
    { rpcUrl: "/api" },
    { jwt: "test" },
    { apiKey: "key" },
    { rpcUrl: "/api", jwt: "jwt" },
  ])("should successfully create a provider", (args) => {
    expect(() =>
      createAlchemySmartAccountClient({
        transport: alchemy({
          ...args,
        }),
        chain,
      }),
    ).not.toThrowError();
  });

  it("should correctly do runtime validation when connection config is invalid", () => {
    expect(() =>
      createAlchemySmartAccountClient({
        transport: alchemy({
          rpcUrl: 1 as unknown as string,
        }),
        chain,
      }),
    ).toThrowErrorMatchingSnapshot();
  });

  it("should correctly do runtime validation when chain is not supported by Alchemy", async () => {
    await expect(() => {
      return givenConnectedProvider({ signer, chain: avalanche });
    }).rejects.toThrowErrorMatchingInlineSnapshot(`
      [ZodError: [
        {
          "code": "custom",
          "message": "chain must include an alchemy rpc url. See \`defineAlchemyChain\` or import a chain from \`@account-kit/infra\`.",
          "fatal": true,
          "path": []
        }
      ]]
    `);
  });

  it("should have enhanced api properties on the provider", async () => {
    const alchemy = new Alchemy({
      network: Network.MATIC_MUMBAI,
      apiKey: "test",
    });

    const provider = (await givenConnectedProvider({ signer, chain })).extend(
      alchemyEnhancedApiActions(alchemy),
    );

    expect(provider.account).toBeDefined();
    expect(provider.waitForUserOperationTransaction).toBeDefined();
    expect(provider.sendUserOperation).toBeDefined();
    expect(provider.core).toBeDefined();
  });

  const givenConnectedProvider = async ({
    signer,
    chain,
  }: {
    signer: SmartAccountSigner;
    chain: Chain;
  }) =>
    createMultiOwnerLightAccountClient({
      transport: alchemy({
        jwt: "test",
      }),
      chain,
      signer,
      accountAddress: "0x86f3B0211764971Ad0Fc8C8898d31f5d792faD84",
    });
});
