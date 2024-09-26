import { arbitrumSepolia, sepolia } from "@account-kit/infra";
import { setChain } from "../actions/setChain.js";
import { createConfig } from "../createConfig.js";
import { createDefaultAccountState } from "./store.js";
import { DEFAULT_STORAGE_KEY } from "./types.js";

describe("createConfig tests", () => {
  beforeEach(() => localStorage.clear());

  it("should setup the config with the correct transport", () => {
    const config = givenConfig();

    expect({ ...config.store.getState().transport }).toMatchInlineSnapshot(`
      {
        "config": {
          "policyId": undefined,
          "rpcUrl": "/api/sepolia",
        },
        "updateHeaders": [Function],
      }
    `);
  });

  it("should omit the transport when persisting to storage", () => {
    givenConfig();

    expect(getStorageItem("transport")).toMatchInlineSnapshot(`undefined`);
  });

  it("should rehydrate the transport based on the bundler client", async () => {
    const config = givenConfig();

    // update the chain so we can make sure the store is updated
    expect(getStorageItem("bundlerClient").connection.chain.id).toBe(
      sepolia.id
    );
    await setChain(config, arbitrumSepolia);
    expect(getStorageItem("bundlerClient").connection.chain.id).toBe(
      arbitrumSepolia.id
    );

    // create a config that is the result of a rehydration
    const hydratedConfig = givenConfig();
    await hydratedConfig.store.persist.rehydrate();
    expect(hydratedConfig.store.getState().transport.config)
      .toMatchInlineSnapshot(`
        {
          "rpcUrl": "/api/arbitrumSepolia",
        }
      `);

    expect(hydratedConfig.store.getState().bundlerClient.chain.id).toBe(
      config.store.getState().bundlerClient.chain.id
    );
  });

  const getStorageItem = (name: string) => {
    return JSON.parse(localStorage.getItem(DEFAULT_STORAGE_KEY) ?? "{}")[
      "state"
    ][name];
  };

  const givenConfig = () => {
    const config = createConfig({
      chain: sepolia,
      connections: [
        { chain: sepolia, rpcUrl: "/api/sepolia" },
        { chain: arbitrumSepolia, rpcUrl: "/api/arbitrumSepolia" },
      ],
      signerConnection: { rpcUrl: "/api/signer" },
      storage: () => localStorage,
    });

    config.store.setState({
      accounts: createDefaultAccountState([sepolia, arbitrumSepolia]),
    });

    return config;
  };
});
