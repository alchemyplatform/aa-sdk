import {
  LocalAccountSigner,
  LogLevel,
  Logger,
  sepolia,
  type SmartAccountSigner,
  type UserOperationFeeOptions,
} from "@alchemy/aa-core";
import { http, type Address, type Chain, type HDAccount } from "viem";
import { createMultisigModularAccountClient } from "../client.js";
import { API_KEY, OWNER_MNEMONIC } from "./constants.js";

const chain = sepolia;

Logger.setLogLevel(LogLevel.DEBUG);

describe("Multisig Modular Account Tests", async () => {
  const signer1: SmartAccountSigner<HDAccount> =
    LocalAccountSigner.mnemonicToAccountSigner(OWNER_MNEMONIC, {
      accountIndex: 0,
    });

  const signer2: SmartAccountSigner<HDAccount> =
    LocalAccountSigner.mnemonicToAccountSigner(OWNER_MNEMONIC, {
      accountIndex: 1,
    });

  const signer3: SmartAccountSigner<HDAccount> =
    LocalAccountSigner.mnemonicToAccountSigner(OWNER_MNEMONIC, {
      accountIndex: 2,
    });

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
      '"0x4ff93F25764CefC22aeeE111CEf47CD1B5e05370"'
    );
  });

  it("should execute successfully", async () => {
    const initiator = await givenConnectedProvider({
      signer: signer1,
      chain,
      owners,
      threshold,
    });

    const submitter = await givenConnectedProvider({
      signer: signer2,
      chain,
      owners,
      threshold,
    });

    expect(initiator.getAddress()).toBe(submitter.getAddress());

    const { aggregatedSignature } = await initiator.proposeUserOperation({
      uo: {
        target: initiator.getAddress(),
        data: "0x",
      },
    });

    const result = await submitter.sendUserOperation({
      uo: {
        target: initiator.getAddress(),
        data: "0x",
      },
      context: {
        signature: aggregatedSignature,
      },
    });

    const txnHash = submitter.waitForUserOperationTransaction({
      hash: result.hash,
    });

    await expect(txnHash).resolves.not.toThrowError();
  }, 100000);
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
