import * as AACoreModule from "@alchemy/aa-core";
import {
  LocalAccountSigner,
  polygonMumbai,
  type BatchUserOperationCallData,
  type SmartAccountSigner,
} from "@alchemy/aa-core";
import { Alchemy, Network } from "alchemy-sdk";
import { avalanche, type Chain } from "viem/chains";
import { alchemyEnhancedApiActions } from "./decorators/alchemyEnhancedApis.js";
import { createLightAccountAlchemyClient } from "./lightAccountClient.js";
import { createAlchemySmartAccountClient } from "./smartAccountClient.js";

describe("Light Account Client Tests", () => {
  const dummyMnemonic =
    "test test test test test test test test test test test test";
  const owner = LocalAccountSigner.mnemonicToAccountSigner(dummyMnemonic);
  const chain = polygonMumbai;

  it("should have a JWT property", async () => {
    const spy = vi.spyOn(AACoreModule, "createPublicErc4337Client");
    await givenConnectedProvider({ owner, chain });
    expect(spy.mock.calls[0][0].fetchOptions).toMatchInlineSnapshot(`
      {
        "headers": {
          "Authorization": "Bearer test",
        },
      }
    `);
  });

  it("should correctly encode batch transaction data", async () => {
    const provider = await givenConnectedProvider({ owner, chain });
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
      '"0x47e1da2a000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000deadbeefdeadbeefdeadbeefdeadbeefdeadbeef0000000000000000000000008ba1f109551bd432803012645ac136ddd64dba720000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000004deadbeef000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004cafebabe00000000000000000000000000000000000000000000000000000000"'
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
        ...args,
        chain,
      })
    ).not.toThrowError();
  });

  it("should correctly do runtime validation when connection config is invalid", () => {
    expect(() =>
      createAlchemySmartAccountClient({
        rpcUrl: 1 as unknown as string,
        chain,
      })
    ).toThrowErrorMatchingSnapshot();
  });

  it("should correctly do runtime validation when chain is not supported by Alchemy", async () => {
    await expect(() => {
      return givenConnectedProvider({ owner, chain: avalanche });
    }).rejects.toThrowErrorMatchingInlineSnapshot(`
      "[
        {
          \\"code\\": \\"custom\\",
          \\"message\\": \\"chain is not supported by Alchemy\\",
          \\"fatal\\": true,
          \\"path\\": [
            \\"chain\\"
          ]
        }
      ]"
    `);
  });

  it("should hanve enhanced api properties on the provider", async () => {
    const alchemy = new Alchemy({
      network: Network.MATIC_MUMBAI,
      apiKey: "test",
    });

    const provider = (await givenConnectedProvider({ owner, chain })).extend(
      alchemyEnhancedApiActions(alchemy)
    );

    expect(provider.account).toBeDefined();
    expect(provider.waitForUserOperationTransaction).toBeDefined();
    expect(provider.sendUserOperation).toBeDefined();
    expect(provider.core).toBeDefined();
  });

  const givenConnectedProvider = async ({
    owner,
    chain,
  }: {
    owner: SmartAccountSigner;
    chain: Chain;
  }) =>
    createLightAccountAlchemyClient({
      jwt: "test",
      owner,
      chain,
      accountAddress: "0x86f3B0211764971Ad0Fc8C8898d31f5d792faD84",
    });
});
