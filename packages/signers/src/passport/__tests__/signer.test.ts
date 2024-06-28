import { Passport, type PassportConstructorParams } from "@0xpass/passport";
import { WebauthnSigner } from "@0xpass/webauthn-signer";
import { KeySigner } from "@0xpass/key-signer";
import { PassportSigner } from "../signer.js";
import { mainnet } from "viem/chains";

describe("Passport Signer Tests", () => {
  it("should correctly get address if authenticated", async () => {
    const signer = await webauthnSigner(true);

    const address = await signer.getAddress();
    expect(address).toMatchInlineSnapshot(
      '"0x1234567890123456789012345678901234567890"'
    );
  });

  it("should correctly get address if authenticated with keySigner", async () => {
    const signer = await keySigner(true);

    const address = await signer.getAddress();
    expect(address).toMatchInlineSnapshot(
      '"0x1234567890123456789012345678901234567890"'
    );
  });
});

it("should correctly fail to get address if unauthenticated", async () => {
  const signer = await webauthnSigner(false);

  const address = signer.getAddress();
  await expect(address).rejects.toThrowErrorMatchingInlineSnapshot(
    '"Not authenticated"'
  );
});

it("should correctly get auth details if authenticated", async () => {
  const signer = await webauthnSigner();

  const details = await signer.getAuthDetails();
  expect(details).toMatchInlineSnapshot(`
  {
    "addresses": [
      "0x1234567890123456789012345678901234567890",
    ],
    "authenticatedHeaders": {
      "x-encrypted-key": "encrypted_aes_key",
      "x-session": "encrypted_jwt",
    },
  }
`);
});

it("should correctly get auth details if authenticated with keySigner", async () => {
  const signer = await keySigner();

  const details = await signer.getAuthDetails();
  expect(details).toMatchInlineSnapshot(`
  {
    "addresses": [
      "0x1234567890123456789012345678901234567890",
    ],
    "authenticatedHeaders": {
      "x-encrypted-key": "encrypted_aes_key",
    },
  }
`);
});

it("should correctly fail to get auth details if unauthenticated", async () => {
  const signer = await webauthnSigner(false);

  const details = signer.getAuthDetails();
  await expect(details).rejects.toThrowErrorMatchingInlineSnapshot(
    '"Not authenticated"'
  );
});

it("should correctly sign message if authenticated", async () => {
  const signer = await webauthnSigner();

  const signMessage = await signer.signMessage("test");
  expect(signMessage).toMatchInlineSnapshot('"0xtest"');
});

it("should correctly sign message if authenticated with keySigner", async () => {
  const signer = await keySigner();

  const signMessage = await signer.signMessage("test");
  expect(signMessage).toMatchInlineSnapshot('"0xtest"');
});

it("should correctly fail to sign message if unauthenticated", async () => {
  const signer = await webauthnSigner(false);

  const signMessage = signer.signMessage("test");
  await expect(signMessage).rejects.toThrowErrorMatchingInlineSnapshot(
    '"Not authenticated"'
  );
});

it("should correctly sign typed data if authenticated", async () => {
  const signer = await webauthnSigner();

  const typedData = {
    domain: {
      name: "Ether Mail",
      version: "1",
      chainId: 1,
      verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
    },
    types: {
      Person: [
        { name: "name", type: "string" },
        { name: "wallet", type: "address" },
      ],
      Mail: [
        { name: "from", type: "Person" },
        { name: "to", type: "Person" },
        { name: "contents", type: "string" },
      ],
    },
    primaryType: "Mail",
    message: {
      from: {
        name: "Cow",
        wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
      },
      to: {
        name: "Bob",
        wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
      },
      contents: "Hello, Bob!",
    },
  };

  const signTypedData = await signer.signTypedData(typedData);
  expect(signTypedData).toMatchInlineSnapshot('"0xtest"');
});

it("should correctly sign typed data if authenticated with keySigner", async () => {
  const signer = await keySigner();

  const typedData = {
    domain: {
      name: "Ether Mail",
      version: "1",
      chainId: 1,
      verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
    },
    types: {
      Person: [
        { name: "name", type: "string" },
        { name: "wallet", type: "address" },
      ],
      Mail: [
        { name: "from", type: "Person" },
        { name: "to", type: "Person" },
        { name: "contents", type: "string" },
      ],
    },
    primaryType: "Mail",
    message: {
      from: {
        name: "Cow",
        wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
      },
      to: {
        name: "Bob",
        wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
      },
      contents: "Hello, Bob!",
    },
  };

  const signTypedData = await signer.signTypedData(typedData);
  expect(signTypedData).toMatchInlineSnapshot('"0xtest"');
});

class TestPassport extends Passport {
  constructor(config: PassportConstructorParams) {
    super(config);

    const ENCRYPTED_AES_KEY =
      "jCQUpLs717SowbGoH7gdeeRmNE1le0Qg2wORqSIGEWDxuQn7ijOmEQI6gZpdXHgYOKCnLbCl2D1PeG/c3FL3VjquxDiC0/LfrBT4S2JZp0LGSRkT8+l7yR0hhltDUYXjfTj3p1Zdyn13git8WK5mijDZ5jI6r+8t3+IC/VkgIAq6z7eyfh6XQGprgwCcVh7tEcUGpKtHWkwMWExOjUgtIZfn1NFGAb9LwsC/6tGri0jIY3X0fU4XEBzMntA2Pep1/bxGuxgY2QGStiI9gKnXyuB2QyQtQ0SX92oVsjeHHXVIYhRuzV21Udln2QkxURquOhcIuPS+9nI674X2qLC60A==";

    const AES_KEY_ARRAY = [
      63, 126, 199, 191, 143, 250, 69, 51, 5, 155, 5, 208, 241, 216, 170, 132,
      244, 43, 103, 155, 145, 171, 155, 160, 202, 110, 173, 134, 179, 13, 145,
      34,
    ];

    this.aesKey = new Uint8Array(AES_KEY_ARRAY).buffer;
    this.encryptedAesKey = ENCRYPTED_AES_KEY;
  }
}

const webauthnSigner = async (auth = true) => {
  const inner = new TestPassport({
    signer: new WebauthnSigner({
      rpId: "rpId",
      rpName: "rpName",
    }),
  });

  inner.authenticate = vi.fn().mockResolvedValue([
    {
      "x-encrypted-key": "encrypted_aes_key",
      "x-session": "encrypted_jwt",
    },
    "0x1234567890123456789012345678901234567890",
  ]);

  const signer = new PassportSigner({ inner });

  if (auth) {
    await signer.authenticate({
      username: "test",
      userDisplayName: "test",
      chain: mainnet,
      fallbackProvider: "fallbackProvider",
    });

    vi.spyOn(signer, "getAddress").mockResolvedValue(
      "0x1234567890123456789012345678901234567890"
    );
    vi.spyOn(signer, "signMessage").mockResolvedValue("0xtest");
    vi.spyOn(signer, "signTypedData").mockResolvedValue("0xtest");
  }

  return signer;
};

const keySigner = async (auth = true) => {
  const inner = new TestPassport({
    signer: new KeySigner(
      "MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg3lU3ELbjh8Fvsmcf3sYVjb1mGSNaEjx2NMJtO2oiIL6hRANCAATg9bDfsI4j5TPWZMijeyJPQSPcpr9V+GdxAx/5ToNfQAHzQUdaA4AaTeDa1ymsFbOHoUGiskDMfaOMLHlQYC2f",
      true
    ),
  });

  inner.authenticate = vi
    .fn()
    .mockResolvedValue([{}, "0x1234567890123456789012345678901234567890"]);

  const signer = new PassportSigner({ inner });

  if (auth) {
    await signer.authenticate({
      username: "test",
      chain: mainnet,
      fallbackProvider: "fallbackProvider",
    });

    vi.spyOn(signer, "getAddress").mockResolvedValue(
      "0x1234567890123456789012345678901234567890"
    );
    vi.spyOn(signer, "signMessage").mockResolvedValue("0xtest");
    vi.spyOn(signer, "signTypedData").mockResolvedValue("0xtest");
  }

  return signer;
};
