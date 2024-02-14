import { createModularAccountAlchemyClient } from "@alchemy/aa-alchemy";
import { LocalAccountSigner, sepolia, type Hex } from "@alchemy/aa-core";

const chain = sepolia;

// The private key of your EOA that will be the owner of Light Account
// Our recommendation is to store the private key in an environment variable
const PRIVATE_KEY = "0xYourEOAPrivateKey" as Hex;
const owner = LocalAccountSigner.privateKeyToAccountSigner(PRIVATE_KEY);

// Create a smart account client to send user operations from your smart account
const client = await createModularAccountAlchemyClient({
  // get your Alchemy API key at https://dashboard.alchemy.com
  apiKey: "ALCHEMY_API_KEY",
  chain,
  owner,
});

(async () => {
  // Fund your account address with ETH to send for the user operations
  // (e.g. Get Sepolia ETH at https://sepoliafaucet.com)
  console.log("Smart Account Address: ", client.getAddress()); // Log the smart account address
})();
