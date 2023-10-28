// importing required dependencies
import {
  LightSmartContractAccount,
  getDefaultLightAccountFactory,
} from "@alchemy/aa-accounts";
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import { LocalAccountSigner, type SmartAccountSigner } from "@alchemy/aa-core";
import { sepolia } from "viem/chains";

const chain = sepolia;
const PRIVATE_KEY = "0xYourEOAPrivateKey"; // Replace with the private key of your EOA that will be the owner of Light Account

const eoaSigner: SmartAccountSigner =
  LocalAccountSigner.privateKeyToAccountSigner(PRIVATE_KEY); // Create a signer for your EOA

// Default address for Light Account on Sepolia, you can replace it with your own.
const factoryAddress = await getDefaultLightAccountFactory(chain);

// Create a provider with your EOA as the smart account owner, this provider is used to send user operations from your smart account and interact with the blockchain
const provider = new AlchemyProvider({
  apiKey: "ALCHEMY_API_KEY", // Replace with your Alchemy API key, you can get one at https://dashboard.alchemy.com/
  chain,
}).connect(
  (rpcClient) =>
    new LightSmartContractAccount({
      // Entrypoint address, you can use a different entrypoint if needed, check out https://docs.alchemy.com/reference/eth-supportedentrypoints for all the supported entrypoints
      entryPointAddress: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
      chain: rpcClient.chain,
      owner: eoaSigner,
      factoryAddress,
      rpcClient,
    })
);

// Logging the smart account address -- please fund this address with some SepoliaETH in order for the user operations to be executed successfully
provider.getAddress().then((address: string) => console.log(address));

// Send a user operation from your smart contract account
const { hash } = await provider.sendUserOperation({
  target: "0xTargetAddress", // Replace with the desired target address
  data: "0xCallData", // Replace with the desired call data
  value: 0n, // value: bigint or undefined
});

console.log(hash); // Log the user operation hash
