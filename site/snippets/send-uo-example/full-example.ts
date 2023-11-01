import {
  LightSmartContractAccount,
  getDefaultLightAccountFactoryAddress,
} from "@alchemy/aa-accounts";
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import { LocalAccountSigner, type SmartAccountSigner } from "@alchemy/aa-core";
import { sepolia } from "viem/chains";

const provider = new AlchemyProvider({
  apiKey: "ALCHEMY_API_KEY", // replace with your Alchemy API Key
  chain: sepolia,
});

const chain = sepolia;
const PRIVATE_KEY = "0xYourEOAPrivateKey";
const eoaSigner: SmartAccountSigner =
  LocalAccountSigner.privateKeyToAccountSigner(`0x${PRIVATE_KEY}`);

const connectedProvider = provider.connect(
  (rpcClient) =>
    new LightSmartContractAccount({
      chain,
      owner: eoaSigner,
      factoryAddress: getDefaultLightAccountFactoryAddress(chain),
      rpcClient,
    })
);

connectedProvider.withAlchemyGasManager({
  policyId: "POLICY_ID", // replace with your policy id, get yours at https://dashboard.alchemy.com/
});

const uo = await connectedProvider.sendUserOperation({
  target: "0xTargetAddress",
  data: "0xCallData",
});

const txHash = await connectedProvider.waitForUserOperationTransaction(uo.hash);

console.log(txHash);
