import { createModularAccountAlchemyClient } from "@alchemy/aa-alchemy";
import {
  Address,
  LocalAccountSigner,
  sepolia,
  type Hex,
} from "@alchemy/aa-core";

// select your chain from @alchemy/aa-core
const chain = sepolia;

// The private key of your EOA that will be the signer to connect with the Modular Account
const PRIVATE_KEY = "0xYourEOAPrivateKey" as Hex;
const signer = LocalAccountSigner.privateKeyToAccountSigner(PRIVATE_KEY);

// [!code focus:22]
(async () => {
  // Create a smart account client to send user operations from your smart account
  const client = await createModularAccountAlchemyClient({
    // get your Alchemy API key at https://dashboard.alchemy.com
    apiKey: "ALCHEMY_API_KEY",
    chain,
    signer,
  });

  // Fund your account address with ETH to send for the user operations
  // (e.g. Get Sepolia ETH at https://sepoliafaucet.com)
  console.log("Smart Account Address: ", client.getAddress()); // Log the smart account address

  const vitalikAddress =
    "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" as Address;
  // Send a user operation from your smart account to Vitalik that does nothing
  const { hash: uoHash } = await client.sendUserOperation({
    uo: {
      target: vitalikAddress, // The desired target contract address
      data: "0x", // The desired call data
      value: 0n, // (Optional) value to send the target contract address
    },
  });

  console.log("UserOperation Hash: ", uoHash); // Log the user operation hash

  // Wait for the user operation to be mined
  const txHash = await client.waitForUserOperationTransaction({
    hash: uoHash,
  });

  console.log("Transaction Hash: ", txHash); // Log the transaction hash
})();
