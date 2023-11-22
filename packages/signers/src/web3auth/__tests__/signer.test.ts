import type { RequestArguments } from "@web3auth/base";
import { Web3Auth } from "@web3auth/modal";
import { Web3AuthSigner } from "../signer.js";

describe("Web3Auth Signer Tests", () => {
  it("should correctly get address", async () => {
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

  it("should correctly get auth details", async () => {
    const signer = await givenSigner();

    const details = await signer.getAuthDetails();
    expect(details).toMatchInlineSnapshot(`
      {
        "aggregateVerifier": "aggregateVerifier",
        "dappShare": "dappShare",
        "email": "email",
        "idToken": "idToken",
        "name": "name",
        "oAuthAccessToken": "oAuthAccessToken",
        "oAuthIdToken": "oAuthIdToken",
        "profileImage": "profileImage",
        "typeOfLogin": "typeOfLogin",
        "verifier": "verifier",
        "verifierId": "verifierId",
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
  const inner = new Web3Auth({
    clientId: "test",
    chainConfig: {
      chainNamespace: "eip155",
    },
  });

  inner.getUserInfo = vi.fn().mockResolvedValue({
    email: "email",
    name: "name",
    profileImage: "profileImage",
    aggregateVerifier: "aggregateVerifier",
    verifier: "verifier",
    verifierId: "verifierId",
    typeOfLogin: "typeOfLogin",
    dappShare: "dappShare",
    idToken: "idToken",
    oAuthIdToken: "oAuthIdToken",
    oAuthAccessToken: "oAuthAccessToken",
  });

  vi.spyOn(inner, "provider", "get").mockReturnValue({
    request: <T, R>(args: RequestArguments<T>) => {
      switch (args.method) {
        case "eth_accounts":
          return Promise.resolve([
            "0x1234567890123456789012345678901234567890",
          ]) as R;
        case "personal_sign":
          return Promise.resolve("0xtest") as R;
        case "eth_signTypedData_v4":
          return Promise.resolve("0xtest") as R;
        default:
          return Promise.reject(new Error("Method not found"));
      }
    },
  } as any);

  const signer = new Web3AuthSigner({ inner });

  if (auth) {
    await signer.authenticate({
      init: () => Promise.resolve(),
      connect: () => Promise.resolve(),
    });
  }

  return signer;
};
