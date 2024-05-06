import type { LitSessionSigsMap } from "../types.js";

export const MOCK_SESSION: LitSessionSigsMap = {
  "https://cayenne.litgateway.com:7370": {
    sig: "4602ce38b1d7838d62cac0027cf2cbf19f29eab5d0526fd4c41cbb44f2a8e174230cb00c32973f99d02b7e762a6113e0c1ca876edec832f055c487f18db66c0c",
    derivedVia: "litSessionSignViaNacl",
    signedMessage:
      '{"sessionKey":"9130d115e4b02bf53367392d343f0ee9804880ebac0648be17178f5dfc92ea9b","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-litaction"},"ability":"pkp-signing"}],"capabilities":[{"sig":"0xef364dda26a85b128a812efc0ab2fb63065b78f9594aaa908688c2dd3b7876e041c256a5d2359079beab55df6842bf3aab9e16ca34c7333bebc4a00809b515b71b","derivedVia":"web3.eth.personal.sign via Lit PKP","signedMessage":"localhost:3000 wants you to sign in with your Ethereum account:\\n0xfB3b886A3579d2D82F6333E8D84A19F550891E13\\n\\nLit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: (1) \'*\': \'*\' for \'lit-litaction://*\'.\\n\\nURI: lit:session:9130d115e4b02bf53367392d343f0ee9804880ebac0648be17178f5dfc92ea9b\\nVersion: 1\\nChain ID: 1\\nNonce: WZsOAM0hBBUrY7QlG\\nIssued At: 2023-12-10T17:24:26.910Z\\nExpiration Time: 2023-12-17T17:24:25.843Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiKi8qIjpbe31dfX0sInByZiI6W119","address":"0xfB3b886A3579d2D82F6333E8D84A19F550891E13"}],"issuedAt":"2023-12-10T17:24:28.230Z","expiration":"2023-12-10T17:29:28.230Z","nodeAddress":"https://cayenne.litgateway.com:7370"}',
    address: "9130d115e4b02bf53367392d343f0ee9804880ebac0648be17178f5dfc92ea9b",
    algo: "ed25519",
  },
  "https://cayenne.litgateway.com:7371": {
    sig: "b069d358773b8f6926e832d04f4f454c457bef99ce498f108cab5fa086cc3739983bc6fa848a3389cc29d20987fd9637ac0053af1dcb43c9f19e2c23648e5c08",
    derivedVia: "litSessionSignViaNacl",
    signedMessage:
      '{"sessionKey":"9130d115e4b02bf53367392d343f0ee9804880ebac0648be17178f5dfc92ea9b","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-litaction"},"ability":"pkp-signing"}],"capabilities":[{"sig":"0xef364dda26a85b128a812efc0ab2fb63065b78f9594aaa908688c2dd3b7876e041c256a5d2359079beab55df6842bf3aab9e16ca34c7333bebc4a00809b515b71b","derivedVia":"web3.eth.personal.sign via Lit PKP","signedMessage":"localhost:3000 wants you to sign in with your Ethereum account:\\n0xfB3b886A3579d2D82F6333E8D84A19F550891E13\\n\\nLit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: (1) \'*\': \'*\' for \'lit-litaction://*\'.\\n\\nURI: lit:session:9130d115e4b02bf53367392d343f0ee9804880ebac0648be17178f5dfc92ea9b\\nVersion: 1\\nChain ID: 1\\nNonce: WZsOAM0hBBUrY7QlG\\nIssued At: 2023-12-10T17:24:26.910Z\\nExpiration Time: 2023-12-17T17:24:25.843Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiKi8qIjpbe31dfX0sInByZiI6W119","address":"0xfB3b886A3579d2D82F6333E8D84A19F550891E13"}],"issuedAt":"2023-12-10T17:24:28.230Z","expiration":"2023-12-10T17:29:28.230Z","nodeAddress":"https://cayenne.litgateway.com:7371"}',
    address: "9130d115e4b02bf53367392d343f0ee9804880ebac0648be17178f5dfc92ea9b",
    algo: "ed25519",
  },
  "https://cayenne.litgateway.com:7372": {
    sig: "88e471cd53b41daba9904c0454dbcd3e050c200885b792f9b4213d52ef43fb77074ab38b74f6bbe6d72342a979e85996617bad03d6b26deeaf3946a102b93308",
    derivedVia: "litSessionSignViaNacl",
    signedMessage:
      '{"sessionKey":"9130d115e4b02bf53367392d343f0ee9804880ebac0648be17178f5dfc92ea9b","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-litaction"},"ability":"pkp-signing"}],"capabilities":[{"sig":"0xef364dda26a85b128a812efc0ab2fb63065b78f9594aaa908688c2dd3b7876e041c256a5d2359079beab55df6842bf3aab9e16ca34c7333bebc4a00809b515b71b","derivedVia":"web3.eth.personal.sign via Lit PKP","signedMessage":"localhost:3000 wants you to sign in with your Ethereum account:\\n0xfB3b886A3579d2D82F6333E8D84A19F550891E13\\n\\nLit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: (1) \'*\': \'*\' for \'lit-litaction://*\'.\\n\\nURI: lit:session:9130d115e4b02bf53367392d343f0ee9804880ebac0648be17178f5dfc92ea9b\\nVersion: 1\\nChain ID: 1\\nNonce: WZsOAM0hBBUrY7QlG\\nIssued At: 2023-12-10T17:24:26.910Z\\nExpiration Time: 2023-12-17T17:24:25.843Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiKi8qIjpbe31dfX0sInByZiI6W119","address":"0xfB3b886A3579d2D82F6333E8D84A19F550891E13"}],"issuedAt":"2023-12-10T17:24:28.230Z","expiration":"2023-12-10T17:29:28.230Z","nodeAddress":"https://cayenne.litgateway.com:7372"}',
    address: "9130d115e4b02bf53367392d343f0ee9804880ebac0648be17178f5dfc92ea9b",
    algo: "ed25519",
  },
};

export const TEST_CONTEXT = {
  CONTROLLER_AUTHSIG: {
    sig: "0xfba04bf9da7004ea9f30bbb8a40660339cc93aae8fcb7da34deb2b5ae87a2d77106e8507d1c679d6fce7228d245346ac384a772d73cb179a88003ff09974bded1b",
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
      "Nonce: 0xc9198a635a9c2b94c9dd8cafa014106ac07e5dfb1e50f33589b87b11cd902265\n" +
      "Issued At: 2024-04-25T21:20:50.724Z\n" +
      "Expiration Time: 2024-04-25T22:20:50.722Z",
    address: "0xeF71c2604f17Ec6Fc13409DF24EfdC440D240d37",
  },
  PKP_INFO: {
    publicKey:
      "04fdf2d4e3c76c23ac194b45e543c9d10cca9646d62cffe242e19df21e8d6acf79e6b34490ee7f8383ca21a7cf273950b5371e36450976da0895fcbf9b253ca4ea",
    ethAddress: "0xd3D4e3b881e52d314B6E5591EbA6Debe4b612827",
    authMethod: {
      authMethodId:
        "0x170d13600caea2933912f39a0334eca3d22e472be203f937c4bad0213d92ed71",
      authMethodType: 1,
    },
  },
  AUTH_NEEDED_CB_RES: {
    authSig: {
      sig: "0x07069c9d252a1fecdc56ab38bb2cda62d79b966f57a11c9136cd9c221e8563735199b53948fd8df61884d856919561b4b48beeabd2baad11bde2490f3b60e50d1b",
      derivedVia: "web3.eth.personal.sign via Lit PKP",
      signedMessage:
        "localhost:3000 wants you to sign in with your Ethereum account:\n0xfB3b886A3579d2D82F6333E8D84A19F550891E13\n\nLit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: (1) '*': '*' for 'lit-litaction://*'.\n\nURI: lit:session:ccad2c92e8d52c6221d4e15194a4d57bd442a75a8be27f9b09d4ef5f26d67c4f\nVersion: 1\nChain ID: 1\nNonce: pK9FZb51gdRUGGEyr\nIssued At: 2023-12-12T20:43:05.224Z\nExpiration Time: 2023-12-19T20:43:05.222Z\nResources:\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiKi8qIjpbe31dfX0sInByZiI6W119",
      address: "0xfB3b886A3579d2D82F6333E8D84A19F550891E13",
    },
    pkpPublicKey:
      "04f4cd980d2e41d80872b7465cdbfb7ef6dbe5a7354f583ebaf6333194dd2e31d257933cad9bf317ffd7519bab03ada9ede80987732bc889de5066033d57dc5399",
  },
};

export const RPC_MUMBAI_URL =
  "https://endpoints.omniatech.io/v1/matic/mumbai/public";
