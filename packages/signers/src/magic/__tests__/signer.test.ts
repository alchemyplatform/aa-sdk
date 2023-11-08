import { Magic } from "magic-sdk";
import { MagicSigner } from "../signer.js";

describe("Magic Signer Tests", () => {
  it("should correctly error when signing message if not authenticated", async () => {
    const signer = await givenSigner();

    const signMessage = signer.signMessage("test");
    await expect(signMessage).rejects.toThrowErrorMatchingInlineSnapshot(
      '"No signer found"'
    );
  });
});

const givenSigner = async () => {
  const inner = new Magic("test");

  const signer = new MagicSigner({ inner });

  return signer;
};
