import * as AACoreModule from "@alchemy/aa-core";
import {
  getDefaultEntryPointAddress,
  type BatchUserOperationCallData,
  type SmartAccountSigner,
} from "@alchemy/aa-core";
import { Alchemy, Network } from "alchemy-sdk";
import { toHex, type Address, type Chain, type HDAccount } from "viem";
import { mnemonicToAccount } from "viem/accounts";
import { polygonMumbai } from "viem/chains";
import { AlchemyProvider } from "../base.js";
import { createLightAccountAlchemyProvider } from "../light-account.js";

describe("Alchemy Provider Tests", () => {
  const dummyMnemonic =
    "test test test test test test test test test test test test";
  const ownerAccount = mnemonicToAccount(dummyMnemonic);
  const owner: SmartAccountSigner<HDAccount> = {
    inner: ownerAccount,
    signMessage: async (msg) =>
      ownerAccount.signMessage({
        message: { raw: toHex(msg) },
      }),
    signTypedData: async () => "0xHash",
    getAddress: async () => ownerAccount.address,
    signerType: "aa-sdk-tests",
  };
  const chain = polygonMumbai;

  it("should have a JWT property", async () => {
    const spy = vi.spyOn(AACoreModule, "createPublicErc4337Client");
    givenConnectedProvider({ owner, chain });
    expect(spy.mock.calls[0][0].fetchOptions).toMatchInlineSnapshot(`
      {
        "headers": {
          "Authorization": "Bearer test",
        },
      }
    `);
  });

  it("should correctly sign the message", async () => {
    const provider = givenConnectedProvider({ owner, chain });
    expect(
      // TODO: expose sign message on the provider too
      await provider.account.signMessage(
        "0xa70d0af2ebb03a44dcd0714a8724f622e3ab876d0aa312f0ee04823285d6fb1b"
      )
    ).toBe(
      "0x33b1b0d34ba3252cd8abac8147dc08a6e14a6319462456a34468dd5713e38dda3a43988460011af94b30fa3efefcf9d0da7d7522e06b7bd8bff3b65be4aee5b31c"
    );
  });

  it("should correctly encode batch transaction data", async () => {
    const provider = givenConnectedProvider({ owner, chain });
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
      '"0x18dfb3c7000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000002000000000000000000000000deadbeefdeadbeefdeadbeefdeadbeefdeadbeef0000000000000000000000008ba1f109551bd432803012645ac136ddd64dba720000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000004deadbeef000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004cafebabe00000000000000000000000000000000000000000000000000000000"'
    );
  });

  it("should correctly do runtime validation when entrypoint is invalid", () => {
    expect(
      () =>
        new AlchemyProvider({
          rpcUrl: `${chain.rpcUrls.alchemy.http[0]}/test`,
          entryPointAddress: 1 as unknown as Address,
          chain,
        })
    ).toThrowErrorMatchingInlineSnapshot(`
      "[
        {
          \\"code\\": \\"invalid_type\\",
          \\"expected\\": \\"string\\",
          \\"received\\": \\"number\\",
          \\"path\\": [
            \\"entryPointAddress\\"
          ],
          \\"message\\": \\"Expected string, received number\\"
        }
      ]"
    `);
  });

  it("should correctly do runtime validation when connection config is invalid", () => {
    expect(
      () =>
        new AlchemyProvider({
          rpcUrl: 1 as unknown as string,
          entryPointAddress: getDefaultEntryPointAddress(chain),
          chain,
        })
    ).toThrowErrorMatchingSnapshot();
  });

  it("should have enhanced api properties extended from the Alchemy SDK", async () => {
    const provider = new AlchemyProvider({
      apiKey: "test",
      chain,
    });
    const spy = vi.spyOn(provider, "withAlchemyEnhancedApis");

    const alchemy = new Alchemy({
      network: Network.MATIC_MUMBAI,
      apiKey: "test",
    });
    provider.withAlchemyEnhancedApis(alchemy);

    expect(spy.mock.calls[0][0]).toMatchSnapshot();
  });

  it("should throw runtime error if chains don't match between provider and AlchemySDK client", async () => {
    expect(() => {
      const alchemy = new Alchemy({
        network: Network.MATIC_MAINNET,
        apiKey: "test",
      });

      givenConnectedProvider({ owner, chain }).withAlchemyEnhancedApis(alchemy);
    }).toThrowErrorMatchingInlineSnapshot(
      '"Alchemy SDK client JSON-RPC URL must match AlchemyProvider JSON-RPC URL"'
    );
  });
});

const givenConnectedProvider = ({
  owner,
  chain,
}: {
  owner: SmartAccountSigner;
  chain: Chain;
}) =>
  createLightAccountAlchemyProvider({
    jwt: "test",
    owner,
    chain,
  });
