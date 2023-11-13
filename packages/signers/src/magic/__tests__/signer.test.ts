import * as AASignersModule from "@alchemy/aa-signers";
import { Magic } from "magic-sdk";
import { MagicSigner } from "../signer.js";

vi.mock("viem", async () => {
  const createWalletClient = vi.fn().mockResolvedValue({
    bind: async () => Promise.resolve(),
    signMessage: async () => Promise.resolve("0xtest"),
    signTypedData: async () => Promise.resolve("0xtest"),
  });

  const actual = await vi.importActual("viem");
  return {
    ...(actual as any),
    createWalletClient,
  };
});

describe("Magic Signer Tests", () => {
  it("should correctly error when signing message if not authenticated", async () => {
    const signer = await givenSigner(false);

    const signMessage = signer.signMessage("test");
    await expect(signMessage).rejects.toThrowErrorMatchingInlineSnapshot(
      '"Not authenticated"'
    );
  });

  it("should correctly authenticate", async () => {
    const spy = vi.spyOn(AASignersModule, "MagicSigner");
    givenSigner();
    expect(spy.mock.calls).toMatchInlineSnapshot("[]");
  });

  it.only("should correctly get address", async () => {
    const signer = await givenSigner();

    const address = await signer.getAddress();
    expect(address).toMatchInlineSnapshot('"test"');
  });

  it("should correctly get auth details", async () => {
    const signer = await givenSigner();

    const address = await signer.getAuthDetails();
    expect(address).toMatchInlineSnapshot(`
      {
        "email": "test",
        "isMfaEnabled": false,
        "issuer": null,
        "phoneNumber": "1234567890",
        "publicAddress": "test",
        "recoveryFactors": [],
      }
    `);
  });

  it.skip("should correctly sign message if authenticated", async () => {
    const signer = await givenSigner();

    const signMessage = await signer.signMessage("test");
    expect(signMessage).toMatchInlineSnapshot();
  });

  it.skip("should correctly sign typed data if authenticated", async () => {
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
  const inner = new Magic("test");

  inner.user.getInfo = vi.fn().mockResolvedValue({
    publicAddress: "test",
    issuer: null,
    email: "test",
    phoneNumber: "1234567890",
    isMfaEnabled: false,
    recoveryFactors: [],
  });

  // inner.wallet.getProvider = vi.fn().mockResolvedValue({
  //   type: "local",
  //   source: "custom",
  //   publicKey: "0xtest",
  //   address: "0xtest",
  //   signMessage: () => Promise.resolve("0xtest"),
  //   signTransaction: () => Promise.resolve("0xtest"),
  //   signTypedData: () => Promise.resolve("0xtest"),
  // } as LocalAccount);

  const signer = new MagicSigner({ inner });

  if (auth) {
    await signer.authenticate({
      authenticate: () => Promise.resolve(),
    });
  }

  return signer;
};
