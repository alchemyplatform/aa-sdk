import type { PKPEthersWallet } from "@lit-protocol/pkp-ethers";
import { LitSigner } from "../signer.js";
import type { LitAuthMethod } from "../index.js";
import { MOCK_SESSION, TEST_CONTEXT } from "./data.js";
import type { LitNodeClient } from "@lit-protocol/lit-node-client";

describe("Lit Protocol Signer Tests", () => {
  let signer: LitSigner<LitAuthMethod> | undefined;
  beforeAll(async () => {
    signer = await setup();
    await signer?.authenticate({
      context: {
        authMethodType: 1,
        accessToken: JSON.stringify(TEST_CONTEXT.CONTROLLER_AUTHSIG),
      },
    });
  });

  it("should correctly get address if authenticated", async () => {
    let sessionSignatures = await signer?.getAuthDetails();
    expect(sessionSignatures).toBeDefined();
    expect((await signer?.getAddress())?.toLowerCase()).toEqual(
      TEST_CONTEXT.PKP_INFO.ethAddress.toLowerCase()
    );
  });

  it("should return auth details if authenticated", async () => {
    let sessionSignatures = await signer?.getAuthDetails();
    expect(sessionSignatures).toBeDefined();
  });

  it("should sign message if authenticated", async () => {
    const typedData = {
      types: {
        Request: [{ name: "hello", type: "string" }],
      },
      primaryType: "Request",
      message: {
        hello: "world",
      },
    };
    const signTypedData = await signer?.signTypedData(typedData);
    expect(signTypedData).toMatchInlineSnapshot('"0xtest"');
  });

  it("should throw expection if not authenticated", async () => {
    const signer = new LitSigner<LitAuthMethod>({
      rpcUrl: "foo.bar",
      pkpPublicKey: "041234534abcd",
    });

    expect(signer.getAddress()).rejects.toThrowError();
  });
});

const setup = async () => {
  const signer = new LitSigner<LitAuthMethod>({
    rpcUrl: "https://endpoints.omniatech.io/v1/matic/mumbai/public",
    pkpPublicKey: TEST_CONTEXT.PKP_INFO.publicKey,
  });
  signer.inner.connect = vi.fn().mockImplementation(() => {
    return new Promise<void>((res, _) => res());
  });
  signer.inner.signSessionKey = vi.fn().mockImplementation(() => {
    return TEST_CONTEXT.AUTH_NEEDED_CB_RES;
  });
  signer.inner.ready = true;
  await signer?.authenticate({
    context: {
      authMethodType: 1,
      accessToken: JSON.stringify(TEST_CONTEXT.CONTROLLER_AUTHSIG),
    },
  });
  (signer.signer as PKPEthersWallet).getAddress = vi
    .fn()
    .mockResolvedValue(TEST_CONTEXT.PKP_INFO.ethAddress);

  (signer.inner as LitNodeClient).getSessionSigs = vi
    .fn()
    .mockResolvedValue(MOCK_SESSION);

  (signer.signer as PKPEthersWallet)._signTypedData = vi
    .fn()
    .mockResolvedValue("0xtest");
  return signer;
};
