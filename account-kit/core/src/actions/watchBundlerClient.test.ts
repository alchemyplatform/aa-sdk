import { alchemy, arbitrumSepolia, sepolia } from "@account-kit/infra";
import { AlchemySignerStatus } from "@account-kit/signer";
import { createConfig } from "../createConfig.js";
import {
  convertSignerStatusToState,
  createDefaultAccountState,
} from "../store/store.js";
import { setChain } from "./setChain.js";
import { watchBundlerClient } from "./watchBundlerClient.js";

describe("watchBundlerClient", () => {
  it("should not fire the callback if transport or chain didn't change", () => {
    const config = givenConfig();
    const onChange = vi.fn();

    watchBundlerClient(config)(onChange);

    config.store.setState({
      signerStatus: convertSignerStatusToState(
        AlchemySignerStatus.AWAITING_EMAIL_AUTH,
        undefined,
      ),
    });

    expect(onChange).not.toHaveBeenCalled();
  });

  it("should fire the callback if chain changed", async () => {
    const config = givenConfig();
    const onChange = vi.fn();

    watchBundlerClient(config)(onChange);

    await setChain(config, arbitrumSepolia);

    expect(onChange).toHaveBeenCalled();
  });

  it("should not fire if the chain id is the same", async () => {
    const config = givenConfig();
    const onChange = vi.fn();

    watchBundlerClient(config)(onChange);

    await setChain(config, sepolia);

    expect(onChange).not.toHaveBeenCalled();
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
