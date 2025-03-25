import {
  alchemy,
  arbitrumSepolia,
  baseSepolia,
  sepolia,
} from "@account-kit/infra";
import { getAlchemyTransport } from "../actions/getAlchemyTransport.js";
import { setChain } from "../actions/setChain.js";
import { createConfig } from "../createConfig.js";
import { createDefaultAccountState, STORAGE_VERSION } from "./store.js";
import { DEFAULT_STORAGE_KEY } from "./types.js";

describe("createConfig tests", () => {
  it("should setup the config with the correct transport", async () => {
    const config = await givenConfig();

    expect({ ...getAlchemyTransport(config) }).toMatchInlineSnapshot(`
      {
        "config": {
          "rpcUrl": "/api/sepolia",
        },
        "dynamicFetchOptions": {
          "headers": {
            "Alchemy-AA-Sdk-Version": "4.17.0",
          },
        },
        "updateHeaders": [Function],
      }
    `);
  });

  it("should rehydrate the current chain and transport", async () => {
    const config = await givenConfig();

    // update the chain so we can make sure the store is updated
    expect(getStorageItem("chain").id).toBe(sepolia.id);
    await setChain(config, arbitrumSepolia);
    expect(getStorageItem("chain").id).toBe(arbitrumSepolia.id);

    // create a config that is the result of a rehydration
    const hydratedConfig = await givenConfig();

    expect(hydratedConfig.store.getState().chain.id).toBe(
      config.store.getState().chain.id
    );

    expect(hydratedConfig.store.getState().bundlerClient.chain.id).toBe(
      config.store.getState().bundlerClient.chain.id
    );

    expect(getAlchemyTransport(hydratedConfig).config).toMatchInlineSnapshot(`
        {
          "rpcUrl": "/api/arbitrumSepolia",
        }
      `);
  });

  it("should overwrite the state if the config changed (chain removed)", async () => {
    await givenConfig();
    expect(getStorageItem("connections")).toMatchInlineSnapshot(`
      {
        "__type": "Map",
        "value": [
          [
            11155111,
            {
              "chain": {
                "id": 11155111,
              },
              "policyId": "test-policy-id",
              "transport": {
                "__type": "Transport",
                "rpcUrl": "/api/sepolia",
              },
            },
          ],
          [
            421614,
            {
              "chain": {
                "id": 421614,
              },
              "transport": {
                "__type": "Transport",
                "rpcUrl": "/api/arbitrumSepolia",
              },
            },
          ],
        ],
      }
    `);

    const config2 = createConfig({
      chain: sepolia,
      chains: [
        {
          chain: sepolia,
          transport: alchemy({ rpcUrl: "/api/sepolia" }),
          policyId: "test-policy-id",
        },
      ],
      signerConnection: { rpcUrl: "/api/signer" },
      storage: () => localStorage,
    });

    await config2.store.persist.rehydrate();
    config2.store.setState({
      accounts: createDefaultAccountState([sepolia, arbitrumSepolia]),
    });
    expect(getStorageItem("connections")).toMatchInlineSnapshot(`
      {
        "__type": "Map",
        "value": [
          [
            11155111,
            {
              "chain": {
                "id": 11155111,
              },
              "policyId": "test-policy-id",
              "transport": {
                "__type": "Transport",
                "rpcUrl": "/api/sepolia",
              },
            },
          ],
        ],
      }
    `);
  });

  it("should overwrite the state if the config changed (policyId changed)", async () => {
    await givenConfig();
    expect(getStorageItem("connections")).toMatchInlineSnapshot(`
      {
        "__type": "Map",
        "value": [
          [
            11155111,
            {
              "chain": {
                "id": 11155111,
              },
              "policyId": "test-policy-id",
              "transport": {
                "__type": "Transport",
                "rpcUrl": "/api/sepolia",
              },
            },
          ],
          [
            421614,
            {
              "chain": {
                "id": 421614,
              },
              "transport": {
                "__type": "Transport",
                "rpcUrl": "/api/arbitrumSepolia",
              },
            },
          ],
        ],
      }
    `);

    const config2 = createConfig({
      chain: sepolia,
      chains: [
        {
          chain: sepolia,
          transport: alchemy({ rpcUrl: "/api/sepolia" }),
          policyId: "test-policy-id2",
        },
        {
          chain: arbitrumSepolia,
          transport: alchemy({ rpcUrl: "/api/arbitrumSepolia" }),
        },
      ],
      signerConnection: { rpcUrl: "/api/signer" },
      storage: () => localStorage,
    });

    await config2.store.persist.rehydrate();
    config2.store.setState({
      accounts: createDefaultAccountState([sepolia, arbitrumSepolia]),
    });
    expect(getStorageItem("connections")).toMatchInlineSnapshot(`
      {
        "__type": "Map",
        "value": [
          [
            11155111,
            {
              "chain": {
                "id": 11155111,
              },
              "policyId": "test-policy-id2",
              "transport": {
                "__type": "Transport",
                "rpcUrl": "/api/sepolia",
              },
            },
          ],
          [
            421614,
            {
              "chain": {
                "id": 421614,
              },
              "transport": {
                "__type": "Transport",
                "rpcUrl": "/api/arbitrumSepolia",
              },
            },
          ],
        ],
      }
    `);
  });

  it("should overwrite the state if the config changed (chain swapped out)", async () => {
    await givenConfig();
    expect(getStorageItem("connections")).toMatchInlineSnapshot(`
      {
        "__type": "Map",
        "value": [
          [
            11155111,
            {
              "chain": {
                "id": 11155111,
              },
              "policyId": "test-policy-id",
              "transport": {
                "__type": "Transport",
                "rpcUrl": "/api/sepolia",
              },
            },
          ],
          [
            421614,
            {
              "chain": {
                "id": 421614,
              },
              "transport": {
                "__type": "Transport",
                "rpcUrl": "/api/arbitrumSepolia",
              },
            },
          ],
        ],
      }
    `);

    const config2 = createConfig({
      chain: sepolia,
      chains: [
        {
          chain: sepolia,
          transport: alchemy({ rpcUrl: "/api/sepolia" }),
          policyId: "test-policy-id",
        },
        {
          chain: baseSepolia,
          // this isn't a typo, I'm testing the chain swap out
          transport: alchemy({ rpcUrl: "/api/arbitrumSepolia" }),
        },
      ],
      signerConnection: { rpcUrl: "/api/signer" },
      storage: () => localStorage,
    });

    await config2.store.persist.rehydrate();
    config2.store.setState({
      accounts: createDefaultAccountState([sepolia, arbitrumSepolia]),
    });
    expect(getStorageItem("connections")).toMatchInlineSnapshot(`
      {
        "__type": "Map",
        "value": [
          [
            11155111,
            {
              "chain": {
                "id": 11155111,
              },
              "policyId": "test-policy-id",
              "transport": {
                "__type": "Transport",
                "rpcUrl": "/api/sepolia",
              },
            },
          ],
          [
            84532,
            {
              "chain": {
                "id": 84532,
              },
              "transport": {
                "__type": "Transport",
                "rpcUrl": "/api/arbitrumSepolia",
              },
            },
          ],
        ],
      }
    `);
  });

  it("should overwrite the state if the config changed (signer config)", async () => {
    await givenConfig();
    expect(getStorageItem("config")).toMatchInlineSnapshot(`
      {
        "client": {
          "connection": {
            "rpcUrl": "/api/signer",
          },
        },
      }
    `);

    const config2 = createConfig({
      chain: sepolia,
      chains: [
        {
          chain: sepolia,
          transport: alchemy({ rpcUrl: "/api/sepolia" }),
          policyId: "test-policy-id",
        },
        {
          chain: baseSepolia,
          // this isn't a typo, I'm testing the chain swap out
          transport: alchemy({ rpcUrl: "/api/arbitrumSepolia" }),
        },
      ],
      signerConnection: { rpcUrl: "/api/signer" },
      oauthCallbackUrl: "https://example.com",
      storage: () => localStorage,
    });

    await config2.store.persist.rehydrate();
    config2.store.setState({
      accounts: createDefaultAccountState([sepolia, arbitrumSepolia]),
    });
    expect(getStorageItem("config")).toMatchInlineSnapshot(`
      {
        "client": {
          "connection": {
            "rpcUrl": "/api/signer",
          },
          "oauthCallbackUrl": "https://example.com",
        },
      }
    `);
  });

  it("should overwrite the state if the config changed (transport changed out)", async () => {
    await givenConfig();
    expect(getStorageItem("connections")).toMatchInlineSnapshot(`
      {
        "__type": "Map",
        "value": [
          [
            11155111,
            {
              "chain": {
                "id": 11155111,
              },
              "policyId": "test-policy-id",
              "transport": {
                "__type": "Transport",
                "rpcUrl": "/api/sepolia",
              },
            },
          ],
          [
            421614,
            {
              "chain": {
                "id": 421614,
              },
              "transport": {
                "__type": "Transport",
                "rpcUrl": "/api/arbitrumSepolia",
              },
            },
          ],
        ],
      }
    `);

    const config2 = createConfig({
      chain: sepolia,
      chains: [
        {
          chain: sepolia,
          transport: alchemy({ rpcUrl: "/api/sepolia" }),
          policyId: "test-policy-id",
        },
        {
          chain: arbitrumSepolia,
          // this isn't a typo, I'm testing the chain swap out
          transport: alchemy({ apiKey: "test-api-key" }),
        },
      ],
      signerConnection: { rpcUrl: "/api/signer" },
      storage: () => localStorage,
    });

    await config2.store.persist.rehydrate();
    config2.store.setState({
      accounts: createDefaultAccountState([sepolia, arbitrumSepolia]),
    });
    expect(getStorageItem("connections")).toMatchInlineSnapshot(`
      {
        "__type": "Map",
        "value": [
          [
            11155111,
            {
              "chain": {
                "id": 11155111,
              },
              "policyId": "test-policy-id",
              "transport": {
                "__type": "Transport",
                "rpcUrl": "/api/sepolia",
              },
            },
          ],
          [
            421614,
            {
              "chain": {
                "id": 421614,
              },
              "transport": {
                "__type": "Transport",
                "apiKey": "test-api-key",
              },
            },
          ],
        ],
      }
    `);
  });

  it("should correctly serialize the state to storage", async () => {
    await givenConfig();

    expect(JSON.parse(localStorage.getItem(DEFAULT_STORAGE_KEY) ?? "{}"))
      .toMatchInlineSnapshot(`
        {
          "state": {
            "accountConfigs": {
              "11155111": {},
              "421614": {},
            },
            "chain": {
              "id": 11155111,
            },
            "config": {
              "client": {
                "connection": {
                  "rpcUrl": "/api/signer",
                },
              },
            },
            "connections": {
              "__type": "Map",
              "value": [
                [
                  11155111,
                  {
                    "chain": {
                      "id": 11155111,
                    },
                    "policyId": "test-policy-id",
                    "transport": {
                      "__type": "Transport",
                      "rpcUrl": "/api/sepolia",
                    },
                  },
                ],
                [
                  421614,
                  {
                    "chain": {
                      "id": 421614,
                    },
                    "transport": {
                      "__type": "Transport",
                      "rpcUrl": "/api/arbitrumSepolia",
                    },
                  },
                ],
              ],
            },
            "signerStatus": {
              "isAuthenticating": false,
              "isConnected": false,
              "isDisconnected": false,
              "isInitializing": true,
              "status": "INITIALIZING",
            },
          },
          "version": ${STORAGE_VERSION},
        }
      `);
  });

  it("should serialize/deserialize state correctly when using single chain config", async () => {
    const config = createConfig({
      chain: sepolia,
      transport: alchemy({ rpcUrl: "/api/sepolia" }),
      signerConnection: { rpcUrl: "/api/signer" },
      sessionConfig: {
        expirationTimeMs: 1000,
      },
      policyId: "test-policy-id",
      storage: () => localStorage,
    });

    await config.store.persist.rehydrate();

    config.store.setState({
      accounts: createDefaultAccountState([sepolia]),
    });

    expect(JSON.parse(localStorage.getItem(DEFAULT_STORAGE_KEY) ?? "{}"))
      .toMatchInlineSnapshot(`
        {
          "state": {
            "accountConfigs": {
              "11155111": {},
            },
            "chain": {
              "id": 11155111,
            },
            "config": {
              "client": {
                "connection": {
                  "rpcUrl": "/api/signer",
                },
              },
              "sessionConfig": {
                "expirationTimeMs": 1000,
              },
            },
            "connections": {
              "__type": "Map",
              "value": [
                [
                  11155111,
                  {
                    "chain": {
                      "id": 11155111,
                    },
                    "policyId": "test-policy-id",
                    "transport": {
                      "__type": "Transport",
                      "rpcUrl": "/api/sepolia",
                    },
                  },
                ],
              ],
            },
            "signerStatus": {
              "isAuthenticating": false,
              "isConnected": false,
              "isDisconnected": false,
              "isInitializing": true,
              "status": "INITIALIZING",
            },
          },
          "version": ${STORAGE_VERSION},
        }
      `);
  });

  const getStorageItem = (name: string) => {
    return JSON.parse(localStorage.getItem(DEFAULT_STORAGE_KEY) ?? "{}")[
      "state"
    ][name];
  };

  const givenConfig = async () => {
    const config = createConfig({
      chain: sepolia,
      chains: [
        {
          chain: sepolia,
          transport: alchemy({ rpcUrl: "/api/sepolia" }),
          policyId: "test-policy-id",
        },
        {
          chain: arbitrumSepolia,
          transport: alchemy({ rpcUrl: "/api/arbitrumSepolia" }),
        },
      ],
      signerConnection: { rpcUrl: "/api/signer" },
      storage: () => localStorage,
    });

    await config.store.persist.rehydrate();

    config.store.setState({
      accounts: createDefaultAccountState([sepolia, arbitrumSepolia]),
    });

    return config;
  };
});
