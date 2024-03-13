import { sepolia } from "@alchemy/aa-core";
import Capsule, {
  Environment,
  createCapsuleViemClient,
} from "@usecapsule/web-sdk";
import {
  http,
  type EIP1193RequestFn,
  type EIP1474Methods,
  type WalletClient,
} from "viem";
import { CapsuleSigner } from "../signer.js";

describe("Capsule Signer Tests", () => {
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
        "wallet_0": {
          "address": "0x1234567890123456789012345678901234567890",
          "id": "test",
          "publicKey": "test",
          "scheme": "CGGMP",
          "signer": "test",
        },
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
  const inner = new Capsule(Environment.DEVELOPMENT, "test");

  inner.getWallets = vi.fn().mockReturnValue({
    wallet_0: {
      id: "test",
      signer: "test",
      address: "0x1234567890123456789012345678901234567890",
      publicKey: "test",
      scheme: "CGGMP",
    },
  });

  const client = createCapsuleViemClient(inner, {
    chain: sepolia,
    transport: http(`${sepolia.rpcUrls.alchemy.http[0]}/test`) as any,
  }) as unknown as WalletClient; // TODO: Capsule team to address lint error

  client.request = vi.fn(async (args) => {
    switch (args.method) {
      case "eth_accounts":
        return Promise.resolve(["0x1234567890123456789012345678901234567890"]);
      case "personal_sign":
        return Promise.resolve("0xtest");
      case "eth_signTypedData_v4":
        return Promise.resolve("0xtest");
      default:
        return Promise.reject(new Error("Method not found"));
    }
  }) as EIP1193RequestFn<EIP1474Methods>;

  const signer = new CapsuleSigner({ inner, client });

  if (auth) {
    await signer.authenticate();
  }

  return signer;
};
