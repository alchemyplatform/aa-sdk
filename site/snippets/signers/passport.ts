import { PassportSigner } from "@alchemy/aa-signers/passport";
import { Passport } from "@0xpass/passport";
import { WebauthnSigner } from "@0xpass/webauthn-signer";
import { http } from "viem";
import { sepolia } from "@alchemy/aa-core";

export const passport = new Passport({
  scope_id: "scope_id",
  signer: new WebauthnSigner({
    rpId: "rpId",
    rpName: "rpName",
  }),
});

export const createPassportSigner = async () => {
  const passportSigner = new PassportSigner({ inner: passport });

  await passportSigner.authenticate({
    username: "test",
    userDisplayName: "test",
    chain: sepolia,
    fallbackProvider: http(
      "https://eth-sepolia.g.alchemy.com/v2/ALCHEMY_API_KEY"
    ),
  });

  return passportSigner;
};
