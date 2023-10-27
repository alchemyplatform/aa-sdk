import { LocalAccountSigner } from "@alchemy/aa-core";
import { ApiKeyStamper } from "@turnkey/api-key-stamper";
import { TurnkeyClient } from "@turnkey/http";
import { createAccount } from "@turnkey/viem";
export async function newTurnkeySigner() {
    const turnkeyClient = new TurnkeyClient({
        /*
          Configurable, but you will likely use "https://api.turnkey.com".
        */
        baseUrl: process.env.TURNKEY_BASE_URL,
    }, new ApiKeyStamper({
        /*
          You will generate these values as part of our quickstart guide:
          
          https://docs.turnkey.com/getting-started/quickstart
          
          They are what the signer will use to authenticate requests to the Turnkey.com.
        */
        apiPublicKey: process.env.TURNKEY_API_PUBLIC_KEY,
        apiPrivateKey: process.env.TURNKEY_API_PRIVATE_KEY,
    }));
    const turnkeyAccount = await createAccount({
        client: turnkeyClient,
        /*
            You can pull this from the top right widget in the Turnkey dashboard.
            The quickstart guide details how to do this.
        */
        organizationId: process.env.TURNKEY_ORGANIZATION_ID,
        /*
            This value should be the ID of the private key that you want to own
            the light smart contract. Similarly pulled from the dashboard and
            documented in the quickstart guide.
        */
        privateKeyId: process.env.TURNKEY_PRIVATE_KEY_ID,
    });
    const turnkeySigner = new LocalAccountSigner(turnkeyAccount);
    return turnkeySigner;
}
