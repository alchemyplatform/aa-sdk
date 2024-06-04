import { sepolia } from "@alchemy/aa-core";
import Portal from "@portal-hq/web";
import { PortalSigner } from "../signer.js";

// taken from Portal SDK since not exported
interface RequestArguments {
  method: string;
  params?: unknown[];
}

describe("Portal Signer Tests", () => {
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
        "address": "0x1234567890123456789012345678901234567890",
        "backupStatus": null,
        "custodian": {
          "id": "1",
          "name": "test",
        },
        "id": "0",
        "signingStatus": null,
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
  const inner = new Portal({
    autoApprove: true,
    gatewayConfig: `${sepolia.rpcUrls.alchemy.http}/${process.env.ALCHEMY_API_KEY}`,
    chainId: sepolia.id,
  });

  inner.getClient = vi.fn().mockResolvedValue({
    id: "0",
    address: "0x1234567890123456789012345678901234567890",
    backupStatus: null,
    custodian: {
      id: "1",
      name: "test",
    },
    signingStatus: null,
  });

  inner.provider.request = vi.fn(async <R>(args: RequestArguments) => {
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
  });

  const signer = new PortalSigner({ inner });

  if (auth) {
    await signer.authenticate();
  }

  return signer;
};
