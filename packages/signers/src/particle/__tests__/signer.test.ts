import { ParticleNetwork, type JsonRpcRequest } from "@particle-network/auth";
import { ParticleProvider } from "@particle-network/provider";
import { ParticleSigner } from "../signer.js";

describe("Particle Signer Tests", () => {
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
        "avatar": "test.png",
        "email": "test@gmail.com",
        "name": "test",
        "phone": "1234567890",
        "token": "test",
        "uuid": "test",
        "wallets": [],
      }
    `);
  });

  it("should correctly get auth details if unauthenticated but has active account state", async () => {
    const signer = await givenSigner(false, true);

    const details = await signer.getAuthDetails();
    expect(details).toMatchInlineSnapshot(`
      {
        "avatar": "test.png",
        "email": "test@gmail.com",
        "name": "test",
        "phone": "1234567890",
        "token": "test",
        "uuid": "test",
        "wallets": [],
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

const givenSigner = async (auth = true, isLogin = false) => {
  const inner = new ParticleNetwork({
    projectId: "test",
    clientKey: "test",
    appId: "test",
    chainName: "polygon",
    chainId: 80001,
  });

  inner.auth.isLogin = () => isLogin;

  inner.auth.getUserInfo = vi.fn().mockResolvedValue({
    uuid: "test",
    token: "test",
    wallets: [],
    name: "test",
    avatar: "test.png",
    phone: "1234567890",
    email: "test@gmail.com",
  });

  const provider = new ParticleProvider(inner.auth);

  provider.request = vi.fn(async <R>(args: Partial<JsonRpcRequest>) => {
    switch (args.method) {
      case "eth_accounts":
        return Promise.resolve([
          "0x1234567890123456789012345678901234567890",
          "0x0987654321098765432109876543210987654321",
        ]) as R;
      case "personal_sign":
        return Promise.resolve("0xtest") as R;
      case "eth_signTypedData_v4":
        return Promise.resolve("0xtest") as R;
      default:
        return Promise.reject(new Error("Method not found"));
    }
  });

  const signer = new ParticleSigner({ inner, provider });

  if (auth) {
    await signer.authenticate({
      loginOptions: {},
      login: () => Promise.resolve(),
    });
  }

  return signer;
};
