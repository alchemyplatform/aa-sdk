import { AlchemySignerWebClient } from "../client/index.js";
import { SessionManager } from "./manager.js";

describe("session manager", () => {
  beforeEach(() => {
    // Mock the document.getElementById method
    vi.spyOn(document, "getElementById").mockImplementation((id) => {
      if (id === "alchemy-signer-iframe-container") {
        return document.createElement("div");
      }
      return null;
    });
  });

  it("should set the expiration time as defined in the config", () => {
    const manager = createManager();
    expect(manager.expirationTimeMs).toBe(5000);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const createManager = () => {
    const client = new AlchemySignerWebClient({
      connection: { rpcUrl: "/api/signer" },
      iframeConfig: {
        iframeContainerId: "alchemy-signer-iframe-container",
      },
    });
    return new SessionManager({
      client,
      expirationTimeMs: 5000,
    });
  };
});
