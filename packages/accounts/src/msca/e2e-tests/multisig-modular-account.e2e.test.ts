import {
  LocalAccountSigner,
  LogLevel,
  Logger,
  createBundlerClient,
  createSmartAccountClientFromExisting,
  sepolia,
  type SmartAccountSigner,
  type UserOperationFeeOptions,
} from "@alchemy/aa-core";
import {
  http,
  isAddress,
  type Address,
  type Chain,
  type HDAccount,
} from "viem";
import { generatePrivateKey } from "viem/accounts";
import { multisigPluginActions } from "../../index.js";
import { createMultisigModularAccountClient } from "../client.js";
import {
  API_KEY,
  MODULAR_MULTISIG_ACCOUNT_OWNER_MNEMONIC,
} from "./constants.js";

const chain = sepolia;

Logger.setLogLevel(LogLevel.DEBUG);

describe("Multisig Modular Account Tests", async () => {
  const signer1: SmartAccountSigner<HDAccount> =
    LocalAccountSigner.mnemonicToAccountSigner(
      MODULAR_MULTISIG_ACCOUNT_OWNER_MNEMONIC,
      { accountIndex: 0 }
    );

  const signer2: SmartAccountSigner<HDAccount> =
    LocalAccountSigner.mnemonicToAccountSigner(
      MODULAR_MULTISIG_ACCOUNT_OWNER_MNEMONIC,
      { accountIndex: 1 }
    );

  const signer3: SmartAccountSigner<HDAccount> =
    LocalAccountSigner.mnemonicToAccountSigner(
      MODULAR_MULTISIG_ACCOUNT_OWNER_MNEMONIC,
      { accountIndex: 2 }
    );

  const threshold = 2n;

  const owners = [
    await signer1.getAddress(),
    await signer2.getAddress(),
    await signer3.getAddress(),
  ];

  // todo: 1271 signature verification

  it("should successfully get counterfactual address", async () => {
    const {
      account: { address },
    } = await givenConnectedProvider({
      signer: signer1,
      chain,
      owners,
      threshold,
    });
    expect(address).toMatchInlineSnapshot(
      '"0x995A7E85E909bA030C755b4955836b40c6772C19"'
    );
  });
});

const givenConnectedProvider = async ({
  signer,
  chain,
  accountAddress,
  feeOptions,
  owners,
  threshold,
}: {
  signer: SmartAccountSigner;
  chain: Chain;
  accountAddress?: Address;
  feeOptions?: UserOperationFeeOptions;
  owners: Address[];
  threshold: bigint;
}) => {
  return createMultisigModularAccountClient({
    transport: http(`${chain.rpcUrls.alchemy.http[0]}/${API_KEY!}`),
    chain: chain,
    account: {
      signer,
      accountAddress,
      owners,
      threshold,
    },
    opts: {
      feeOptions: {
        ...feeOptions,
        maxFeePerGas: { multiplier: 1.5 },
        maxPriorityFeePerGas: { multiplier: 1.5 },
      },
      txMaxRetries: 100,
    },
  });
};
