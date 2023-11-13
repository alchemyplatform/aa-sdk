import { Magic } from "magic-sdk";
import { MagicSigner } from "../signer.js";

describe("Magic Signer Tests", () => {
  it("should correctly get address if authenticated", async () => {
    const signer = await givenSigner();

    const address = await signer.getAddress();
    expect(address).toMatchInlineSnapshot(
      '"0x1234567890123456789012345678901234567890"'
    );
  });

  it("should correctly fail to get address if unauthenticated", async () => {
    const signer = await givenSigner(false);

    const address = signer.getAddress();
    await expect(address).rejects.toThrowErrorMatchingInlineSnapshot(
      '"Not authenticated"'
    );
  });

  it("should correctly get auth details if authenticated", async () => {
    const signer = await givenSigner();

    const details = await signer.getAuthDetails();
    expect(details).toMatchInlineSnapshot(`
      {
        "email": "test",
        "isMfaEnabled": false,
        "issuer": null,
        "phoneNumber": "1234567890",
        "publicAddress": "0x1234567890123456789012345678901234567890",
        "recoveryFactors": [],
      }
    `);
  });

  it("should correctly fail to get auth details if unauthenticated", async () => {
    const signer = await givenSigner(false);

    const details = signer.getAuthDetails();
    await expect(details).rejects.toThrowErrorMatchingInlineSnapshot(
      '"Not authenticated"'
    );
  });

  it("should correctly sign message if authenticated", async () => {
    const signer = await givenSigner();

    const signMessage = await signer.signMessage("test");
    expect(signMessage).toMatchInlineSnapshot('"0xtest"');
  });

  it("should correctly fail to sign message if unauthenticated", async () => {
    const signer = await givenSigner(false);

    const signMessage = signer.signMessage("test");
    await expect(signMessage).rejects.toThrowErrorMatchingInlineSnapshot(
      '"Not authenticated"'
    );
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
    expect(signTypedData).toMatchInlineSnapshot('"0xtest"');
  });
});

const givenSigner = async (auth = true) => {
  const inner = new Magic("test");

  inner.user.getInfo = vi.fn().mockResolvedValue({
    publicAddress: "0x1234567890123456789012345678901234567890",
    issuer: null,
    email: "test",
    phoneNumber: "1234567890",
    isMfaEnabled: false,
    recoveryFactors: [],
  });

  inner.wallet.getProvider = vi.fn().mockResolvedValue({
    request: ({ method }: { method: string; params: any[] }) => {
      switch (method) {
        case "eth_accounts":
          return Promise.resolve([
            "0x1234567890123456789012345678901234567890",
          ]);
        case "personal_sign":
          return Promise.resolve("0xtest");
        case "eth_signTypedData_v4":
          return Promise.resolve("0xtest");
        default:
          return Promise.reject(new Error("Method not found"));
      }
    },
  });

  const signer = new MagicSigner({ inner });

  if (auth) {
    await signer.authenticate({
      authenticate: () => Promise.resolve(),
    });
  }

  return signer;
};
