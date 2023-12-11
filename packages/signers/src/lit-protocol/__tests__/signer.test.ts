import { LitSigner } from "../signer.js";
import type { LitAuthMethod } from "../types";
import { MOCK_SESSION, TEST_CONTEXT, signedData } from "./data.js";

describe("Lit Protocol Signer Tests", () => {
  let signer: LitSigner<LitAuthMethod> | undefined;
  beforeAll(async () => {
    signer = await setup();
  });
  it("should correctly get address if authenticated", async () => {
    let sessionSignatures = await signer?.authenticate({
      context: {
        authMethodType: 1,
        accessToken: JSON.stringify(TEST_CONTEXT.CONTROLLER_AUTHSIG),
      },
    });
    expect(sessionSignatures).toBeDefined();
    expect((await signer?.getAddress())?.toLowerCase()).toEqual(
      TEST_CONTEXT.PKP_INFO.ethAddress.toLowerCase()
    );
  });

  it("should sign message if authenticated", async () => {
    await signer?.authenticate({
      context: {
        authMethodType: 1,
        accessToken: JSON.stringify(TEST_CONTEXT.CONTROLLER_AUTHSIG),
      },
    });

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
    expect(signTypedData).toEqual(signedData);
  });
});

const setup = async () => {
  const signer = new LitSigner<LitAuthMethod>({
    rpcUrl: "https://endpoints.omniatech.io/v1/matic/mumbai/public",
    pkpPublicKey: TEST_CONTEXT.PKP_INFO.publicKey,
  });
  signer.getAddress = vi
    .fn()
    .mockResolvedValue(TEST_CONTEXT.PKP_INFO.ethAddress);

  signer.authenticate = vi.fn().mockResolvedValue(MOCK_SESSION);

  signer.getAuthDetails = vi.fn().mockResolvedValue(MOCK_SESSION);
  signer.signTypedData = vi.fn().mockResolvedValue(signedData);
  return signer;
};
