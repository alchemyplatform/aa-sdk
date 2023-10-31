import * as AACoreModule from "@alchemy/aa-core";
import {
  SimpleSmartContractAccount,
  type BatchUserOperationCallData,
  type SmartAccountSigner,
} from "@alchemy/aa-core";
import { toHex, type Address, type Chain } from "viem";
import { mnemonicToAccount } from "viem/accounts";
import { polygonMumbai } from "viem/chains";
import { AlchemyProvider } from "../provider.js";

describe("Alchemy Provider Tests", () => {
  const dummyMnemonic =
    "test test test test test test test test test test test test";
  const ownerAccount = mnemonicToAccount(dummyMnemonic);
  const owner: SmartAccountSigner = {
    signMessage: async (msg) =>
      ownerAccount.signMessage({
        message: { raw: toHex(msg) },
      }),
    signTypedData: async () => "0xHash",
    getAddress: async () => ownerAccount.address,
    signerType: "e2e-test",
  };
  const chain = polygonMumbai;

  it("should have a JWT propety", async () => {
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
    const signer = givenConnectedProvider({ owner, chain });
    expect(
      // TODO: expose sign message on the provider too
      await signer.account.signMessage(
        "0xa70d0af2ebb03a44dcd0714a8724f622e3ab876d0aa312f0ee04823285d6fb1b"
      )
    ).toBe(
      "0x33b1b0d34ba3252cd8abac8147dc08a6e14a6319462456a34468dd5713e38dda3a43988460011af94b30fa3efefcf9d0da7d7522e06b7bd8bff3b65be4aee5b31c"
    );
  });

  it("should correctly encode batch transaction data", async () => {
    const signer = givenConnectedProvider({ owner, chain });
    const account = signer.account;
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
          rpcUrl: "https://eth-mainnet.g.alchemy.com/v2/test",
          entryPointAddress: 1 as unknown as Address,
          chain: polygonMumbai,
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

  it("should correctly do runtime validation when multiple inputs are invalid", () => {
    expect(
      () =>
        new AlchemyProvider({
          rpcUrl: 1 as unknown as string,
          entryPointAddress: 1 as unknown as Address,
          chain: polygonMumbai,
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
        },
        {
          \\"code\\": \\"invalid_union\\",
          \\"unionErrors\\": [
            {
              \\"issues\\": [
                {
                  \\"code\\": \\"invalid_union\\",
                  \\"unionErrors\\": [
                    {
                      \\"issues\\": [
                        {
                          \\"code\\": \\"invalid_union\\",
                          \\"unionErrors\\": [
                            {
                              \\"issues\\": [
                                {
                                  \\"code\\": \\"invalid_type\\",
                                  \\"expected\\": \\"never\\",
                                  \\"received\\": \\"number\\",
                                  \\"path\\": [
                                    \\"rpcUrl\\"
                                  ],
                                  \\"message\\": \\"Expected never, received number\\"
                                },
                                {
                                  \\"code\\": \\"invalid_type\\",
                                  \\"expected\\": \\"string\\",
                                  \\"received\\": \\"undefined\\",
                                  \\"path\\": [
                                    \\"apiKey\\"
                                  ],
                                  \\"message\\": \\"Required\\"
                                }
                              ],
                              \\"name\\": \\"ZodError\\"
                            },
                            {
                              \\"issues\\": [
                                {
                                  \\"code\\": \\"invalid_type\\",
                                  \\"expected\\": \\"never\\",
                                  \\"received\\": \\"number\\",
                                  \\"path\\": [
                                    \\"rpcUrl\\"
                                  ],
                                  \\"message\\": \\"Expected never, received number\\"
                                },
                                {
                                  \\"code\\": \\"invalid_type\\",
                                  \\"expected\\": \\"string\\",
                                  \\"received\\": \\"undefined\\",
                                  \\"path\\": [
                                    \\"jwt\\"
                                  ],
                                  \\"message\\": \\"Required\\"
                                }
                              ],
                              \\"name\\": \\"ZodError\\"
                            }
                          ],
                          \\"path\\": [],
                          \\"message\\": \\"Invalid input\\"
                        }
                      ],
                      \\"name\\": \\"ZodError\\"
                    },
                    {
                      \\"issues\\": [
                        {
                          \\"code\\": \\"invalid_type\\",
                          \\"expected\\": \\"string\\",
                          \\"received\\": \\"number\\",
                          \\"path\\": [
                            \\"rpcUrl\\"
                          ],
                          \\"message\\": \\"Expected string, received number\\"
                        }
                      ],
                      \\"name\\": \\"ZodError\\"
                    }
                  ],
                  \\"path\\": [],
                  \\"message\\": \\"Invalid input\\"
                }
              ],
              \\"name\\": \\"ZodError\\"
            },
            {
              \\"issues\\": [
                {
                  \\"code\\": \\"invalid_type\\",
                  \\"expected\\": \\"string\\",
                  \\"received\\": \\"number\\",
                  \\"path\\": [
                    \\"rpcUrl\\"
                  ],
                  \\"message\\": \\"Expected string, received number\\"
                },
                {
                  \\"code\\": \\"invalid_type\\",
                  \\"expected\\": \\"string\\",
                  \\"received\\": \\"undefined\\",
                  \\"path\\": [
                    \\"jwt\\"
                  ],
                  \\"message\\": \\"Required\\"
                }
              ],
              \\"name\\": \\"ZodError\\"
            }
          ],
          \\"path\\": [],
          \\"message\\": \\"Invalid input\\"
        }
      ]"
    `);
  });
});

const givenConnectedProvider = ({
  owner,
  chain,
}: {
  owner: SmartAccountSigner;
  chain: Chain;
}) => {
  const dummyEntryPointAddress =
    "0x1234567890123456789012345678901234567890" as Address;

  return new AlchemyProvider({
    rpcUrl: "https://eth-mainnet.g.alchemy.com/v2",
    jwt: "test",
    chain,
  }).connect((provider) => {
    const account = new SimpleSmartContractAccount({
      entryPointAddress: dummyEntryPointAddress,
      chain,
      owner,
      factoryAddress: AACoreModule.getDefaultSimpleAccountFactoryAddress(chain),
      rpcClient: provider,
    });

    account.getAddress = vi.fn(
      async () => "0xb856DBD4fA1A79a46D426f537455e7d3E79ab7c4"
    );

    return account;
  });
};
