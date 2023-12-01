import { TurnkeySigner } from "@alchemy/aa-signers";
import { WebauthnStamper } from "@turnkey/webauthn-stamper";
import { http } from "viem";

const TURNKEY_BASE_URL = "https://api.turnkey.com";

/*
 * These are generated using the [Turnkey quickstart guide](https://docs.turnkey.com/getting-started/quickstart)
 * and can be found on the [Turnkey Dashboard](https://app.turnkey.com/dashboard/).
 * - TURNKEY_ORGANIZATION_ID: unique identifier for the organization.
 * - TURNKEY_SIGN_WITH: wallet address or identifier used for signing.
 */
const TURNKEY_ORGANIZATION_ID = "12345678-1234-1234-1234-123456789abc";
const TURNKEY_SIGN_WITH = "0x1234567890123456789012345678901234567890";

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
    organizationId: TURNKEY_ORGANIZATION_ID,
    signWith: TURNKEY_SIGN_WITH,
    transport: http("https://eth-sepolia.g.alchemy.com/v2/ALCHEMY_API_KEY"),
  });

  return turnkeySigner;
};
