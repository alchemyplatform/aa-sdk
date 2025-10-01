import { alchemy, arbitrumSepolia, sepolia } from "@account-kit/infra";
import { AlchemySignerStatus } from "@account-kit/signer";
import { createConfig } from "../createConfig.js";
import {
  convertSignerStatusToState,
  createDefaultAccountState,
} from "../store/store.js";
import { getSmartAccountClient } from "./getSmartAccountClient.js";
import { setChain } from "./setChain.js";
import { watchSmartAccountClient } from "./watchSmartAccountClient.js";

describe("watchSmartAccountClient", () => {
  it("should fire the on subscribe callback if signer status changes", () => {
    const config = givenConfig();
    const onChange = vi.fn();

    watchSmartAccountClient({ type: "LightAccount" }, config)(onChange);

    config.store.setState({
      signerStatus: convertSignerStatusToState(
        AlchemySignerStatus.DISCONNECTED,
        undefined,
      ),
    });

    expect(onChange).toHaveBeenCalled();
  });

  it("should fire the on subscribe callback if account changes", () => {
    const config = givenConfig();
    const onChange = vi.fn();

    watchSmartAccountClient({ type: "LightAccount" }, config)(onChange);

    config.store.setState((state) => ({
      accounts: {
        ...state.accounts,
        [sepolia.id]: {
          ...state.accounts![sepolia.id],
          LightAccount: {
            status: "ERROR",
            account: undefined,
            error: new Error("An error occurred"),
          },
        },
      },
    }));

    expect(onChange).toHaveBeenCalled();
  });

  it("should fire the on subscribe callback if bundler client changes", async () => {
    const config = givenConfig();
    const onChange = vi.fn();

    watchSmartAccountClient({ type: "LightAccount" }, config)(onChange);

    // this will implicitly change the bundler client
    // this is the most likely usecase that the bundler client changes
    await setChain(config, arbitrumSepolia);

    expect(onChange).toHaveBeenCalled();
  });

  it("should return an error and set it in the store if the account is in an error state", async () => {
    const config = givenConfig();
    const onChange = vi.fn();

    watchSmartAccountClient({ type: "LightAccount" }, config)(onChange);

    config.store.setState((state) => ({
      accounts: {
        ...state.accounts,
        [sepolia.id]: {
          ...state.accounts![sepolia.id],
          LightAccount: {
            status: "ERROR",
            account: undefined,
            error: new Error("An error occurred"),
          },
        },
      },
    }));

    const errorState = {
      address: undefined,
      client: undefined,
      isLoadingClient: false,
      error: new Error("An error occurred"),
    };

    expect(onChange).toHaveBeenCalledWith(errorState);

    expect(getSmartAccountClient({ type: "LightAccount" }, config)).toEqual(
      errorState,
    );
  });

  const givenConfig = () => {
    const config = createConfig({
      chain: sepolia,
      chains: [{ chain: sepolia }, { chain: arbitrumSepolia }],
      transport: alchemy({ apiKey: "AN_API_KEY" }),
    });

    config.store.setState({
      accounts: createDefaultAccountState([sepolia, arbitrumSepolia]),
    });

    return config;
  };
});
