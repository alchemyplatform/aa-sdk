import * as AASignersModule from "@alchemy/aa-signers";
import { Magic } from "magic-sdk";
import { MagicSigner } from "../signer.js";

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

  it("should correctly get address", async () => {
    const signer = await givenSigner();

    const address = await signer.getAddress();
    expect(address).toMatchInlineSnapshot('"0x1234567890123456789012345678901234567890"');
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
        "publicAddress": "0x1234567890123456789012345678901234567890",
        "recoveryFactors": [],
      }
    `);
  });

  it("should correctly sign message if authenticated", async () => {
    const signer = await givenSigner();

    const signMessage = await signer.signMessage("test");
    expect(signMessage).toMatchInlineSnapshot('"0xtest"');
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
      console.log("method: ", method);
      if (method === "eth_accounts") {
        return Promise.resolve(["0x1234567890123456789012345678901234567890"]);
      }
      if (method === "personal_sign") {
        return Promise.resolve("0xtest");
      } else if (method === "eth_signTypedData_v4") {
        return Promise.resolve("0xtest");
      }

      return Promise.reject(new Error("Method not found"));
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
