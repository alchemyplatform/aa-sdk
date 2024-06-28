import { PassportSigner } from "@alchemy/aa-signers/passport";
import { Passport, Network } from "@0xpass/passport";
import { WebauthnSigner } from "@0xpass/webauthn-signer";
import { http } from "viem";
import { sepolia } from "@alchemy/aa-core";

export const passport = new Passport({
  scopeId: "scope_id",
  signer: new WebauthnSigner({
    rpId: "rpId",
    rpName: "rpName",
  }),
  network: Network.MAINNET, // If not passed, defaults to TESTNET
});

// If user isn't registered, you can register them with the following
// await passport.setupEncryption();
// await passport.register({
//   username: "test",
//   userDisplayName: "test",
// });

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
