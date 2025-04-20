import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import { SolanaPipe } from "./solanaPipe.js";
import { AlchemySignerWebClient } from "./client/index.js";
import { SolanaSigner } from "./solanaSigner.js";

describe("solana pip", () => {
  beforeEach(() => {
    // Mock the document.getElementById method
    vi.spyOn(document, "getElementById").mockImplementation((id) => {
      if (id === "alchemy-signer-iframe-container") {
        return document.createElement("div");
      }
      return null;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
  it.only("should test a full non sponsored transaction", async () => {
    const client = new AlchemySignerWebClient({
      connection: { rpcUrl: "/api/signer" },
      iframeConfig: {
        iframeContainerId: "alchemy-signer-iframe-container",
      },
    });
    const signer = new SolanaSigner(client);

    const hash = await SolanaPipe.fromSolanaSigner(signer)
      .withTransfer({
        lamports: 10,
        toPubkey: new PublicKey(signer.address),
      })
      .broadcast(
        new Connection(
          `https://solana-devnet.g.alchemy.com/v2/${process.env.API_KEY}`
        )
      );
    expect(hash).toBeTruthy();
  });
  it("should test a full sponsored transaction", async () => {
    const client = new AlchemySignerWebClient({
      connection: { rpcUrl: "/api/signer" },
      iframeConfig: {
        iframeContainerId: "alchemy-signer-iframe-container",
      },
    });
    const signer = new SolanaSigner(client);

    const hash = await SolanaPipe.fromSolanaSigner(signer)
      .withAlchemySponsorship(process.env.POLICY_ID || "")
      .withInstructions([
        SystemProgram.transfer({
          fromPubkey: new PublicKey(signer.address),
          toPubkey: new PublicKey(signer.address),
          lamports: 10,
        }),
      ])
      .broadcast(
        new Connection(
          `https://solana-devnet.g.alchemy.com/v2/${process.env.API_KEY}`
        )
      );
    expect(hash).toBeTruthy();
  });
});
