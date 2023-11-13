import { Magic } from "magic-sdk";
import { MagicSigner } from "../signer.js";
import { MAGIC_API_KEY } from "./constants.js";

describe("Magic Signer Tests", () => {
  it("should correctly get address", async () => {
    const signer = await givenSigner();

    const address = await signer.getAddress();
    expect(address).toMatchInlineSnapshot();
  });

  it("should correctly get auth details", async () => {
    const signer = await givenSigner();

    const address = await signer.getAuthDetails();
    expect(address).toMatchInlineSnapshot();
  });

  it("should correctly sign message if authenticated", async () => {
    const signer = await givenSigner();

    const signMessage = await signer.signMessage("test");
    expect(signMessage).toMatchInlineSnapshot();
  });

  it("should correctly sign typed data if authenticated", async () => {
    const signer = await givenSigner();

    const typedData = {
      types: {
        Request: [{ name: "hello", type: "string" }],
      },
      primaryType: "Request",
      message: {
        hello: "world",
      },
    };
    const signTypedData = await signer.signTypedData(typedData);
    expect(signTypedData).toMatchInlineSnapshot();
  });
});

const givenSigner = async (auth = true) => {
  const inner = new Magic(MAGIC_API_KEY);

  const signer = new MagicSigner({ inner });
  if (auth) {
    await signer.authenticate({
      authenticate: () => {
        inner.auth.loginWithCredential();

        return Promise.resolve();
      },
    });
  }

  return signer;
};
