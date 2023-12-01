import { TurnkeySigner } from "@alchemy/aa-signers";
import { ApiKeyStamper } from "@turnkey/api-key-stamper";
import { http } from "viem";

const TURNKEY_BASE_URL = "https://api.turnkey.com";

// These are generated using the [Turnkey quickstart guide](https://docs.turnkey.com/getting-started/quickstart)
// and can be found on the [Turnkey Dashboard](https://app.turnkey.com/dashboard/).
const TURNKEY_API_PUBLIC_KEY = "test";
const TURNKEY_API_PRIVATE_KEY = "test";
const TURNKEY_ORGANIZATION_ID = "12345678-1234-1234-1234-123456789abc";

// This is a wallet address or ID.
const TURNKEY_SIGN_WITH = "0x1234567890123456789012345678901234567890";

export const createTurnkeySigner = async () => {
  const turnkeySigner = new TurnkeySigner({
    apiUrl: TURNKEY_BASE_URL,
    // API Key, WebAuthn, and Email Auth [stampers](https://docs.turnkey.com/category/api-design)
    // must sign all requests to Turnkey.
    stamper: new ApiKeyStamper({
      apiPublicKey: TURNKEY_API_PUBLIC_KEY,
      apiPrivateKey: TURNKEY_API_PRIVATE_KEY,
    }),
  });

  await turnkeySigner.authenticate({
    organizationId: TURNKEY_ORGANIZATION_ID,
    signWith: TURNKEY_SIGN_WITH,
    transport: http("https://eth-sepolia.g.alchemy.com/v2/ALCHEMY_API_KEY"),
  });

  return turnkeySigner;
};
