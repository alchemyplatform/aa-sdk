import {
  LightSmartContractAccount,
  getDefaultLightAccountFactory,
} from "@alchemy/aa-accounts";
import {
  LocalAccountSigner,
  SmartAccountProvider,
  SmartAccountSigner,
} from "@alchemy/aa-core";
import { polygonMumbai } from "viem/chains";

const owner: SmartAccountSigner =
  LocalAccountSigner.mnemonicToAccountSigner(YOUR_OWNER_MNEMONIC);

export const provider = new SmartAccountProvider({
  rpcProvider: "https://polygon-mumbai.g.alchemy.com/v2/demo",
  entryPointAddress: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
  chain: polygonMumbai,
}).connect(
  (rpcClient) =>
    new LightSmartContractAccount({
      entryPointAddress: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
      chain: polygonMumbai,
      factoryAddress: getDefaultLightAccountFactory(polygonMumbai),
      rpcClient,
      owner,
    })
);
