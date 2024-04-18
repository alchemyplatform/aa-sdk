import {
  FordefiWeb3Provider,
  SignerType,
  UserType,
  type Method,
  type MethodReturnType,
  type RequestArgs,
} from "@fordefi/web3-provider";
import { numberToHex, type TypedDataDefinition } from "viem";
import { FordefiSigner } from "../signer.js";

const fixtures = {
  address: "0x1234567890123456789012345678901234567890",
  chainId: 11155111,
  message: "test",
  signedMessage: "0xtest",
  userId: "12345678-abcd-1234-abcd-123456789012",
  apiUserToken: "123-456",
  userType: UserType.apiUser,
  signerType: SignerType.apiSigner,
} as const;

describe("Fordefi Signer Tests", () => {
  it("should correctly get address", async () => {
    const signer = await givenSigner();

    const address = await signer.getAddress();
    expect(address).toMatchInlineSnapshot(`"${fixtures.address}"`);
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
        "id": "${fixtures.userId}",
        "signerType": "${fixtures.signerType}",
        "userType": "${fixtures.userType}",
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

    const signMessage = await signer.signMessage(fixtures.message);
    expect(signMessage).toMatchInlineSnapshot(`"${fixtures.signedMessage}"`);
  });

  it("should correctly fail to sign message if unauthenticated", async () => {
    const signer = await givenSigner(false);

    const signMessage = signer.signMessage(fixtures.message);
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
    } satisfies TypedDataDefinition;
    const signTypedData = await signer.signTypedData(typedData);
    expect(signTypedData).toMatchInlineSnapshot(`"${fixtures.signedMessage}"`);
  });
});

const givenSigner = async (auth = true) => {
  FordefiWeb3Provider.prototype.request = vi.fn((async <M extends Method>(
    args: RequestArgs<M>
  ) => {
    switch (args.method) {
      case "eth_accounts":
        return Promise.resolve([fixtures.address]) as Promise<
          MethodReturnType<"eth_accounts">
        >;
      case "eth_chainId":
        return Promise.resolve(numberToHex(fixtures.chainId)) as Promise<
          MethodReturnType<"eth_chainId">
        >;
      case "personal_sign":
        return Promise.resolve(fixtures.signedMessage) as Promise<
          MethodReturnType<"personal_sign">
        >;
      case "eth_signTypedData_v4":
        return Promise.resolve(fixtures.signedMessage) as Promise<
          MethodReturnType<"eth_signTypedData_v4">
        >;
      default:
        return Promise.reject(new Error("Method not found"));
    }
  }) as FordefiWeb3Provider["request"]);

  FordefiWeb3Provider.prototype.getUserInfo = vi.fn(() => ({
    id: fixtures.userId,
    signerType: fixtures.signerType,
    userType: fixtures.userType,
  }));

  const inner = new FordefiWeb3Provider({
    chainId: fixtures.chainId,
    address: fixtures.address,
    apiUserToken: fixtures.apiUserToken,
    apiPayloadSignKey: "fakeApiKey",
  });

  const signer = new FordefiSigner({ inner });

  if (auth) {
    await signer.authenticate();
  }

  return signer;
};
