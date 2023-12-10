import { LitSigner } from "../signer.js";
import type { LitAuthMethod } from "../types";

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
    expect(signTypedData).toEqual(
      "0x9c1f44d41585d8969c12560c5100e9e648f461d9b8a61a1b09177a773663a22022bdaa452b4eea90a1e3d487ca84136844b83827ee42957466030f437585e9661b"
    );
  }, 50_000);
  // "0x9c1f44d41585d8969c12560c5100e9e648f461d9b8a61a1b09177a773663a22022bdaa452b4eea90a1e3d487ca84136844b83827ee42957466030f437585e9661b"
});

const TEST_CONTEXT = {
  CONTROLLER_AUTHSIG: {
    sig: "0x3c1908bcc0ae121c72c6088eac009ba2054796100eeb4aabfe20478b5f2bd6d7060b4513df2f3a15d5d6f41c54d55dfa952d8dc808fb19aa8f7137ce998199c71b",
    derivedVia: "web3.eth.personal.sign",
    signedMessage:
      "localhost wants you to sign in with your Ethereum account:\n" +
      "0xeF71c2604f17Ec6Fc13409DF24EfdC440D240d37\n" +
      "\n" +
      "This is a test statement.  You can put anything you want here.\n" +
      "\n" +
      "URI: https://localhost/login\n" +
      "Version: 1\n" +
      "Chain ID: 1\n" +
      "Nonce: qmpK6b1c2t0Dt3ZU9\n" +
      "Issued At: 2023-12-10T16:08:16.725Z\n" +
      "Expiration Time: 2024-06-05T02:28:16.723Z",
    address: "0xeF71c2604f17Ec6Fc13409DF24EfdC440D240d37",
  },
  PKP_INFO: {
    publicKey:
      "04f4cd980d2e41d80872b7465cdbfb7ef6dbe5a7354f583ebaf6333194dd2e31d257933cad9bf317ffd7519bab03ada9ede80987732bc889de5066033d57dc5399",
    ethAddress: "0xfB3b886A3579d2D82F6333E8D84A19F550891E13",
    authMethod: {
      authMethodId:
        "0x170d13600caea2933912f39a0334eca3d22e472be203f937c4bad0213d92ed71",
      authMethodType: 1,
    },
  },
};

const setup = async () => {
  const signer = new LitSigner<LitAuthMethod>({
    rpcUrl: "https://endpoints.omniatech.io/v1/matic/mumbai/public",
    pkpPublicKey: TEST_CONTEXT.PKP_INFO.publicKey,
  });
  signer.getAddress = vi
    .fn()
    .mockResolvedValue("0xfB3b886A3579d2D82F6333E8D84A19F550891E13");

  signer.authenticate = vi.fn().mockResolvedValue({
    "https://cayenne.litgateway.com:7370": {
      sig: "4602ce38b1d7838d62cac0027cf2cbf19f29eab5d0526fd4c41cbb44f2a8e174230cb00c32973f99d02b7e762a6113e0c1ca876edec832f055c487f18db66c0c",
      derivedVia: "litSessionSignViaNacl",
      signedMessage:
        '{"sessionKey":"9130d115e4b02bf53367392d343f0ee9804880ebac0648be17178f5dfc92ea9b","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-litaction"},"ability":"pkp-signing"}],"capabilities":[{"sig":"0xef364dda26a85b128a812efc0ab2fb63065b78f9594aaa908688c2dd3b7876e041c256a5d2359079beab55df6842bf3aab9e16ca34c7333bebc4a00809b515b71b","derivedVia":"web3.eth.personal.sign via Lit PKP","signedMessage":"localhost:3000 wants you to sign in with your Ethereum account:\\n0xfB3b886A3579d2D82F6333E8D84A19F550891E13\\n\\nLit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: (1) \'*\': \'*\' for \'lit-litaction://*\'.\\n\\nURI: lit:session:9130d115e4b02bf53367392d343f0ee9804880ebac0648be17178f5dfc92ea9b\\nVersion: 1\\nChain ID: 1\\nNonce: WZsOAM0hBBUrY7QlG\\nIssued At: 2023-12-10T17:24:26.910Z\\nExpiration Time: 2023-12-17T17:24:25.843Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiKi8qIjpbe31dfX0sInByZiI6W119","address":"0xfB3b886A3579d2D82F6333E8D84A19F550891E13"}],"issuedAt":"2023-12-10T17:24:28.230Z","expiration":"2023-12-10T17:29:28.230Z","nodeAddress":"https://cayenne.litgateway.com:7370"}',
      address:
        "9130d115e4b02bf53367392d343f0ee9804880ebac0648be17178f5dfc92ea9b",
      algo: "ed25519",
    },
    "https://cayenne.litgateway.com:7371": {
      sig: "b069d358773b8f6926e832d04f4f454c457bef99ce498f108cab5fa086cc3739983bc6fa848a3389cc29d20987fd9637ac0053af1dcb43c9f19e2c23648e5c08",
      derivedVia: "litSessionSignViaNacl",
      signedMessage:
        '{"sessionKey":"9130d115e4b02bf53367392d343f0ee9804880ebac0648be17178f5dfc92ea9b","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-litaction"},"ability":"pkp-signing"}],"capabilities":[{"sig":"0xef364dda26a85b128a812efc0ab2fb63065b78f9594aaa908688c2dd3b7876e041c256a5d2359079beab55df6842bf3aab9e16ca34c7333bebc4a00809b515b71b","derivedVia":"web3.eth.personal.sign via Lit PKP","signedMessage":"localhost:3000 wants you to sign in with your Ethereum account:\\n0xfB3b886A3579d2D82F6333E8D84A19F550891E13\\n\\nLit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: (1) \'*\': \'*\' for \'lit-litaction://*\'.\\n\\nURI: lit:session:9130d115e4b02bf53367392d343f0ee9804880ebac0648be17178f5dfc92ea9b\\nVersion: 1\\nChain ID: 1\\nNonce: WZsOAM0hBBUrY7QlG\\nIssued At: 2023-12-10T17:24:26.910Z\\nExpiration Time: 2023-12-17T17:24:25.843Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiKi8qIjpbe31dfX0sInByZiI6W119","address":"0xfB3b886A3579d2D82F6333E8D84A19F550891E13"}],"issuedAt":"2023-12-10T17:24:28.230Z","expiration":"2023-12-10T17:29:28.230Z","nodeAddress":"https://cayenne.litgateway.com:7371"}',
      address:
        "9130d115e4b02bf53367392d343f0ee9804880ebac0648be17178f5dfc92ea9b",
      algo: "ed25519",
    },
    "https://cayenne.litgateway.com:7372": {
      sig: "88e471cd53b41daba9904c0454dbcd3e050c200885b792f9b4213d52ef43fb77074ab38b74f6bbe6d72342a979e85996617bad03d6b26deeaf3946a102b93308",
      derivedVia: "litSessionSignViaNacl",
      signedMessage:
        '{"sessionKey":"9130d115e4b02bf53367392d343f0ee9804880ebac0648be17178f5dfc92ea9b","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-litaction"},"ability":"pkp-signing"}],"capabilities":[{"sig":"0xef364dda26a85b128a812efc0ab2fb63065b78f9594aaa908688c2dd3b7876e041c256a5d2359079beab55df6842bf3aab9e16ca34c7333bebc4a00809b515b71b","derivedVia":"web3.eth.personal.sign via Lit PKP","signedMessage":"localhost:3000 wants you to sign in with your Ethereum account:\\n0xfB3b886A3579d2D82F6333E8D84A19F550891E13\\n\\nLit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: (1) \'*\': \'*\' for \'lit-litaction://*\'.\\n\\nURI: lit:session:9130d115e4b02bf53367392d343f0ee9804880ebac0648be17178f5dfc92ea9b\\nVersion: 1\\nChain ID: 1\\nNonce: WZsOAM0hBBUrY7QlG\\nIssued At: 2023-12-10T17:24:26.910Z\\nExpiration Time: 2023-12-17T17:24:25.843Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiKi8qIjpbe31dfX0sInByZiI6W119","address":"0xfB3b886A3579d2D82F6333E8D84A19F550891E13"}],"issuedAt":"2023-12-10T17:24:28.230Z","expiration":"2023-12-10T17:29:28.230Z","nodeAddress":"https://cayenne.litgateway.com:7372"}',
      address:
        "9130d115e4b02bf53367392d343f0ee9804880ebac0648be17178f5dfc92ea9b",
      algo: "ed25519",
    },
  });

  signer.getAuthDetails = vi.fn().mockResolvedValue({
    "https://cayenne.litgateway.com:7370": {
      sig: "4602ce38b1d7838d62cac0027cf2cbf19f29eab5d0526fd4c41cbb44f2a8e174230cb00c32973f99d02b7e762a6113e0c1ca876edec832f055c487f18db66c0c",
      derivedVia: "litSessionSignViaNacl",
      signedMessage:
        '{"sessionKey":"9130d115e4b02bf53367392d343f0ee9804880ebac0648be17178f5dfc92ea9b","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-litaction"},"ability":"pkp-signing"}],"capabilities":[{"sig":"0xef364dda26a85b128a812efc0ab2fb63065b78f9594aaa908688c2dd3b7876e041c256a5d2359079beab55df6842bf3aab9e16ca34c7333bebc4a00809b515b71b","derivedVia":"web3.eth.personal.sign via Lit PKP","signedMessage":"localhost:3000 wants you to sign in with your Ethereum account:\\n0xfB3b886A3579d2D82F6333E8D84A19F550891E13\\n\\nLit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: (1) \'*\': \'*\' for \'lit-litaction://*\'.\\n\\nURI: lit:session:9130d115e4b02bf53367392d343f0ee9804880ebac0648be17178f5dfc92ea9b\\nVersion: 1\\nChain ID: 1\\nNonce: WZsOAM0hBBUrY7QlG\\nIssued At: 2023-12-10T17:24:26.910Z\\nExpiration Time: 2023-12-17T17:24:25.843Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiKi8qIjpbe31dfX0sInByZiI6W119","address":"0xfB3b886A3579d2D82F6333E8D84A19F550891E13"}],"issuedAt":"2023-12-10T17:24:28.230Z","expiration":"2023-12-10T17:29:28.230Z","nodeAddress":"https://cayenne.litgateway.com:7370"}',
      address:
        "9130d115e4b02bf53367392d343f0ee9804880ebac0648be17178f5dfc92ea9b",
      algo: "ed25519",
    },
    "https://cayenne.litgateway.com:7371": {
      sig: "b069d358773b8f6926e832d04f4f454c457bef99ce498f108cab5fa086cc3739983bc6fa848a3389cc29d20987fd9637ac0053af1dcb43c9f19e2c23648e5c08",
      derivedVia: "litSessionSignViaNacl",
      signedMessage:
        '{"sessionKey":"9130d115e4b02bf53367392d343f0ee9804880ebac0648be17178f5dfc92ea9b","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-litaction"},"ability":"pkp-signing"}],"capabilities":[{"sig":"0xef364dda26a85b128a812efc0ab2fb63065b78f9594aaa908688c2dd3b7876e041c256a5d2359079beab55df6842bf3aab9e16ca34c7333bebc4a00809b515b71b","derivedVia":"web3.eth.personal.sign via Lit PKP","signedMessage":"localhost:3000 wants you to sign in with your Ethereum account:\\n0xfB3b886A3579d2D82F6333E8D84A19F550891E13\\n\\nLit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: (1) \'*\': \'*\' for \'lit-litaction://*\'.\\n\\nURI: lit:session:9130d115e4b02bf53367392d343f0ee9804880ebac0648be17178f5dfc92ea9b\\nVersion: 1\\nChain ID: 1\\nNonce: WZsOAM0hBBUrY7QlG\\nIssued At: 2023-12-10T17:24:26.910Z\\nExpiration Time: 2023-12-17T17:24:25.843Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiKi8qIjpbe31dfX0sInByZiI6W119","address":"0xfB3b886A3579d2D82F6333E8D84A19F550891E13"}],"issuedAt":"2023-12-10T17:24:28.230Z","expiration":"2023-12-10T17:29:28.230Z","nodeAddress":"https://cayenne.litgateway.com:7371"}',
      address:
        "9130d115e4b02bf53367392d343f0ee9804880ebac0648be17178f5dfc92ea9b",
      algo: "ed25519",
    },
    "https://cayenne.litgateway.com:7372": {
      sig: "88e471cd53b41daba9904c0454dbcd3e050c200885b792f9b4213d52ef43fb77074ab38b74f6bbe6d72342a979e85996617bad03d6b26deeaf3946a102b93308",
      derivedVia: "litSessionSignViaNacl",
      signedMessage:
        '{"sessionKey":"9130d115e4b02bf53367392d343f0ee9804880ebac0648be17178f5dfc92ea9b","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-litaction"},"ability":"pkp-signing"}],"capabilities":[{"sig":"0xef364dda26a85b128a812efc0ab2fb63065b78f9594aaa908688c2dd3b7876e041c256a5d2359079beab55df6842bf3aab9e16ca34c7333bebc4a00809b515b71b","derivedVia":"web3.eth.personal.sign via Lit PKP","signedMessage":"localhost:3000 wants you to sign in with your Ethereum account:\\n0xfB3b886A3579d2D82F6333E8D84A19F550891E13\\n\\nLit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: (1) \'*\': \'*\' for \'lit-litaction://*\'.\\n\\nURI: lit:session:9130d115e4b02bf53367392d343f0ee9804880ebac0648be17178f5dfc92ea9b\\nVersion: 1\\nChain ID: 1\\nNonce: WZsOAM0hBBUrY7QlG\\nIssued At: 2023-12-10T17:24:26.910Z\\nExpiration Time: 2023-12-17T17:24:25.843Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiKi8qIjpbe31dfX0sInByZiI6W119","address":"0xfB3b886A3579d2D82F6333E8D84A19F550891E13"}],"issuedAt":"2023-12-10T17:24:28.230Z","expiration":"2023-12-10T17:29:28.230Z","nodeAddress":"https://cayenne.litgateway.com:7372"}',
      address:
        "9130d115e4b02bf53367392d343f0ee9804880ebac0648be17178f5dfc92ea9b",
      algo: "ed25519",
    },
  });
  signer.signTypedData = vi
    .fn()
    .mockResolvedValue(
      "0x9c1f44d41585d8969c12560c5100e9e648f461d9b8a61a1b09177a773663a22022bdaa452b4eea90a1e3d487ca84136844b83827ee42957466030f437585e9661b"
    );
  return signer;
};
