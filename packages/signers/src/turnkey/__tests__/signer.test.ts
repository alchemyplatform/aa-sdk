import { ApiKeyStamper } from "@turnkey/api-key-stamper";
import { TurnkeyClient } from "@turnkey/http";
import { TurnkeySigner } from "../signer.js";
import { custom } from "viem";

describe("Turnkey Signer Tests", () => {
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
        "organizationId": "12345678-1234-1234-1234-1234567890ab",
        "organizationName": "test",
        "userId": "12345678-1234-1234-1234-1234567890ab",
        "username": "test",
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
  const inner = new TurnkeyClient(
    {
      baseUrl: "test",
    },
    new ApiKeyStamper({
      apiPublicKey: "test",
      apiPrivateKey: "test",
    })
  );

  inner.getWhoami = vi.fn().mockResolvedValue({
    organizationId: "12345678-1234-1234-1234-1234567890ab",
    organizationName: "test",
    userId: "12345678-1234-1234-1234-1234567890ab",
    username: "test",
  });

  const transport = custom({
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

  const signer = new TurnkeySigner({ inner });

  if (auth) {
    await signer.authenticate({
      organizationId: "12345678-1234-1234-1234-123456789abc",
      signWith: "0x1234567890123456789012345678901234567890",
      transport: transport,
    });
  }

  return signer;
};
