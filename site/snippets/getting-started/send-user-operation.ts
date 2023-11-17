import {
  LightSmartContractAccount,
  getDefaultLightAccountFactoryAddress,
} from "@alchemy/aa-accounts";
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import { Address, LocalAccountSigner, type Hex } from "@alchemy/aa-core";
import { polygonMumbai } from "viem/chains";

const chain = polygonMumbai;

// The private key of your EOA that will be the owner of Light Account
const PRIVATE_KEY = "0xYourEOAPrivateKey" as Hex;
const owner = LocalAccountSigner.privateKeyToAccountSigner(PRIVATE_KEY);

// Create a provider to send user operations from your smart account
const provider = new AlchemyProvider({
  // get your Alchemy API key at https://dashboard.alchemy.com
  apiKey: "ALCHEMY_API_KEY",
  chain,
}).connect(
  (rpcClient) =>
    new LightSmartContractAccount({
      rpcClient,
      owner,
      chain,
      factoryAddress: getDefaultLightAccountFactoryAddress(chain),
    })
);

// [!code focus:22]
(async () => {
  // Fund your account address with ETH to send for the user operations
  // (e.g. Get Sepolia ETH at https://sepoliafaucet.com)
  console.log("Smart Account Address: ", await provider.getAddress()); // Log the smart account address

  const vitalikAddress =
    "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" as Address;
  // Send a user operation from your smart account to Vitalik that does nothing
  const { hash: uoHash } = await provider.sendUserOperation({
    target: vitalikAddress, // The desired target contract address
    data: "0x", // The desired call data
    value: 0n, // (Optional) value to send the target contract address
  });

  console.log("UserOperation Hash: ", uoHash); // Log the user operation hash

  // Wait for the user operation to be mined
  const txHash = await provider.waitForUserOperationTransaction(uoHash);

  console.log("Transaction Hash: ", txHash); // Log the transaction hash
})();
