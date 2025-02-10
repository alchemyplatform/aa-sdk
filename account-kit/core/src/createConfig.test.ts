import { alchemy, sepolia } from "@account-kit/infra";
import { createConfig } from "./createConfig.js";

describe("createConfig", () => {
  it("should set the internal session length", async () => {
    const config = await givenConfig();
    expect(config._internal.sessionLength).toBe(5000);
  });

  it("should set the session config expiration time", async () => {
    const config = await givenConfig();
    expect(config.store.getState().config.sessionConfig?.expirationTimeMs).toBe(
      5000
    );
  });

  const givenConfig = async () => {
    return createConfig({
      chain: sepolia,
      transport: alchemy({ rpcUrl: "/api/sepolia" }),
      signerConnection: { rpcUrl: "/api/signer" },
      storage: () => localStorage,
      sessionConfig: {
        expirationTimeMs: 5000,
      },
    });
  };
});
