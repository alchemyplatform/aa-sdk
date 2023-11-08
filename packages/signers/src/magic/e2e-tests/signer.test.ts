import { Magic } from "magic-sdk";
import { MagicSigner } from "../signer.js";
import { MAGIC_API_KEY } from "./constants.js";

describe("Magic Signer Tests", () => {
  it("should work", async () => {
    await givenSigner();

    expect(true).toBe(true);
  });
});

const givenSigner = async () => {
  const inner = new Magic(MAGIC_API_KEY);

  const signer = new MagicSigner({ inner });

  return signer;
};
