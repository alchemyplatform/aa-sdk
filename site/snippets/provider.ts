import { LightSmartContractAccount } from "@alchemy/aa-alchemy";
import {
  LocalAccountSigner,
  SmartAccountProvider,
  SmartAccountSigner,
} from "@alchemy/aa-core";
import { polygonMumbai } from "viem/chains";

const owner: SmartAccountSigner =
  LocalAccountSigner.mnemonicToAccountSigner(MNEMONIC);

export const provider = new SmartAccountProvider(
  "https://polygon-mumbai.g.alchemy.com/v2/demo", // rpcUrl
  "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789", // entryPointAddress
  polygonMumbai // chain
).connect(
  (rpcClient) =>
    new LightSmartContractAccount({
      entryPointAddress: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
      chain: polygonMumbai,
      factoryAddress: "0xfactoryAddress",
      rpcClient,
      owner,
    })
);
