import { LocalAccountSigner, type SmartAccountSigner } from "@alchemy/aa-core";
import { DfnsWallet } from "@dfns/lib-viem";
import { DfnsApiClient } from "@dfns/sdk";
import { AsymmetricKeySigner } from "@dfns/sdk-keysigner";
import { LocalAccount, toAccount } from "viem/accounts";

// See the Dfns example https://github.com/dfns/dfns-sdk-ts/tree/m/examples/libs/viem/alchemy-aa-gasless for details on populating the environment variables.
const DFNS_PRIVATE_KEY = null;
const DFNS_CRED_ID = null;
const DFNS_APP_ORIGIN = null;
const DFNS_APP_ID = null;
const DFNS_AUTH_TOKEN = null;
const DFNS_API_URL = null;
const SEPOLIA_WALLET_ID = null;

const initDfnsWallet = (walletId: string) => {
  const signer = new AsymmetricKeySigner({
    privateKey: DFNS_PRIVATE_KEY!,
    credId: DFNS_CRED_ID!,
    appOrigin: DFNS_APP_ORIGIN!,
  });

  const dfnsClient = new DfnsApiClient({
    appId: DFNS_APP_ID!,
    authToken: DFNS_AUTH_TOKEN!,
    baseUrl: DFNS_API_URL!,
    signer,
  });

  return DfnsWallet.init({
    walletId,
    dfnsClient,
    maxRetries: 10,
  });
};

export const createDfnsSigner = async (): Promise<SmartAccountSigner> => {
  const sepoliaWallet = await initDfnsWallet(SEPOLIA_WALLET_ID!);
  const account = toAccount(sepoliaWallet) as LocalAccount;
  const dfnsSigner = new LocalAccountSigner(account as any);
  return dfnsSigner;
};
