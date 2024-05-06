import type { PKPEthersWallet } from "@lit-protocol/pkp-ethers";
import { LitSigner } from "../signer.js";
import type { LitAuthMethod } from "../index.js";
import { MOCK_SESSION, RPC_MUMBAI_URL, TEST_CONTEXT } from "./data.js";
import type { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitAbility, LitPKPResource } from "@lit-protocol/auth-helpers";

describe("Lit Protocol Signer Tests", () => {
  let signer: LitSigner<LitAuthMethod> | undefined;
  beforeAll(async () => {
    signer = await setup();
    await signer?.authenticate({
      context: {
        authMethodType: 1,
        accessToken: JSON.stringify(TEST_CONTEXT.CONTROLLER_AUTHSIG),
      },
      capacityCreditNeeded: async () => {
        return {
          litResource: {
            resource: new LitPKPResource("*"),
            ability: LitAbility.PKPSigning,
          },
          capacityDelegationAuthSig: {
            sig: "8176c7270f382be8d568a6271682312542b3db16cbc739ddd3c9e9403a2d156720de35ef095a74b77e3600a7170ca9e2d140a927a32d7ccb1e9311839c534cd01b",
            derivedVia: "web3.eth.personal.sign",
            signedMessage:
              "example.com wants you to sign in with your Ethereum account:\n" +
              "0xeF71c2604f17Ec6Fc13409DF24EfdC440D240d37\n" +
              "\n" +
              " I further authorize the stated URI to perform the following actions on my behalf: (1) 'Auth': 'Auth' for 'lit-ratelimitincrease://767'.\n" +
              "\n" +
              "URI: lit:capability:delegation\n" +
              "Version: 1\n" +
              "Chain ID: 1\n" +
              "Nonce: 0xb0870cdf31099bd01bfe1a8728d630311411b0277179ca84ceb6fad788ed4ea1\n" +
              "Issued At: 2024-04-26T21:10:00.468Z\n" +
              "Expiration Time: 2024-04-26T21:16:59.290Z\n" +
              "Resources:\n" +
              "- urn:recap:eyJhdHQiOnsibGl0LXJhdGVsaW1pdGluY3JlYXNlOi8vNzY3Ijp7IkF1dGgvQXV0aCI6W3siZGVsZWdhdGVfdG8iOlsiMzFiNjE5NUJiQzViMzJjNWRkMEMwM2FGMzBmYjJiRWEwMDg4OEQ0MyJdLCJuZnRfaWQiOlsiNzY3Il0sInVzZXMiOiIxIn1dfX0sInByZiI6W119",
            address: "ef71c2604f17ec6fc13409df24efdc440d240d37",
            algo: null,
          },
        };
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

  it("should sign typed data if authenticated", async () => {
    const typedData = {
      types: {
        Request: { name: "hello", type: "string" },
      },
      primaryType: "Request",
      message: {
        hello: "world",
      },
    };
    const signTypedData = await signer?.signTypedData(typedData);
    expect(signTypedData).toMatchInlineSnapshot('"0xtest"');
  });

  it("should sign message if authenticated", async () => {
    const signTypedData = await signer?.signMessage("Hello Alchemy AA SDK");
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
    rpcUrl: RPC_MUMBAI_URL,
    pkpPublicKey: TEST_CONTEXT.PKP_INFO.publicKey,
  });
  signer.inner.connect = vi.fn().mockImplementation(() => {
    return new Promise<void>((res, _) => res());
  });
  signer.inner.latestBlockhash =
    "0xc9198a635a9c2b94c9dd8cafa014106ac07e5dfb1e50f33589b87b11cd902265";
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

  (signer.signer as PKPEthersWallet).signMessage = vi
    .fn()
    .mockResolvedValue("0xtest");
  return signer;
};
