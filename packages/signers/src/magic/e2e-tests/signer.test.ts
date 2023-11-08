import { Magic } from "magic-sdk";
import { MagicSigner } from "../signer.js";
import { MAGIC_API_KEY } from "./constants.js";

describe("Magic Signer Tests", () => {
  it("should work", async () => {
    await givenSigner({ authenticate: false });

    expect(true).toBe(true);
  });
});

const givenSigner = async ({ authenticate }: { authenticate: boolean }) => {
  const inner = new Magic(MAGIC_API_KEY);

  const signer = new MagicSigner({ inner });

  if (authenticate) {
    await signer.authenticateUser();
  }

  return signer;
};
