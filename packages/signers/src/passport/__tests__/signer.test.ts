import { Passport } from "@0xpass/passport";
import { WebauthnSigner } from "@0xpass/webauthn-signer";
import { PassportSigner } from "../signer.js";
import { mainnet } from "viem/chains";

describe("Passport Signer Tests", () => {
  it("should correctly get address if authenticated", async () => {
    const signer = await givenSigner(true);

    const address = await signer.getAddress();
    expect(address).toMatchInlineSnapshot(
      '"0x1234567890123456789012345678901234567890"'
    );
  });
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

const givenSigner = async (auth = true) => {
  const inner = new Passport({
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
