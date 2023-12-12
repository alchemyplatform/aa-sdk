import { TurnkeySigner, TurnkeySubOrganization } from "@alchemy/aa-signers/turnkey";
import { WebauthnStamper } from "@turnkey/webauthn-stamper";
import { http } from "viem";

const TURNKEY_BASE_URL = "https://api.turnkey.com";

export const createTurnkeySigner = async () => {
  const turnkeySigner = new TurnkeySigner({
    apiUrl: TURNKEY_BASE_URL,
    // API Key, WebAuthn, or Email Auth [stampers](https://docs.turnkey.com/category/api-design)
    // must sign all requests to Turnkey.
    stamper: new WebauthnStamper({
      rpId: "your.app.xyz",
    }),
  });

  await turnkeySigner.authenticate({
    resolveSubOrganization: async () => {
      return new TurnkeySubOrganization({
        subOrganizationId: "12345678-1234-1234-1234-123456789abc",
        signWith: "0x1234567890123456789012345678901234567890",
      });
    },
    transport: http("https://eth-sepolia.g.alchemy.com/v2/ALCHEMY_API_KEY"),
  });

  return turnkeySigner;
};
