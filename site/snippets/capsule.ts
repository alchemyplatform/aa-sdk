import { WalletClientSigner, type SmartAccountSigner } from "@alchemy/aa-core";
import Capsule, {
  createCapsuleViemClient,
  Environment,
} from "@usecapsule/web-sdk";
import { http } from "viem";
import { sepolia } from "viem/chains";

// get an API Key by filling out this form: https://form.typeform.com/to/hLaJeYJW
const CAPSULE_API_KEY = null;

// Capsule's viem client supports custom chains and providers
// Remember to replace "ALCHEMY_API_KEY" with your own Alchemy API key, get one here: https://dashboard.alchemy.com/
const CHAIN = sepolia;
const PROVIDER = "https://eth-sepolia.g.alchemy.com/v2/ALCHEMY_API_KEY";

// Instantiate the Capsule SDK
// Use the DEVELOPMENT environment for development and PRODUCTION for releases
const capsule = new Capsule(Environment.DEVELOPMENT, CAPSULE_API_KEY);

// returns a viem client that wraps capsule for key methods
const capsuleClient = createCapsuleViemClient(capsule, {
  chain: CHAIN,
  transport: http(PROVIDER),
});

// a smart account signer you can use as an owner on ISmartContractAccount
export const capsuleSigner: SmartAccountSigner = new WalletClientSigner(
  capsuleClient
);
