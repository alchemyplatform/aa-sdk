import type {
  EntryPointDef,
  SmartAccountSigner,
  ToSmartContractAccountParams,
} from "@aa-sdk/core";
import {
  createBundlerClient,
  getEntryPoint,
  getAccountAddress,
} from "@aa-sdk/core";
import {
  concatHex,
  encodeFunctionData,
  type Address,
  type Chain,
  type Hex,
  type Transport,
} from "viem";
import { accountFactoryAbi } from "../abis/accountFactoryAbi.js";
import { getDefaultMAV2FactoryAddress } from "../utils.js";
import {
  type SignerEntity,
  type MAV2Account,
  createMAv2Base,
} from "./common/modularAccountV2Base.js";

export type CreateSMAV2AccountParams<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = Pick<
  ToSmartContractAccountParams<"MAV2Account", TTransport, Chain, "0.7.0">,
  "transport" | "chain" | "accountAddress"
> & {
  signer: TSigner;
  salt?: bigint;
  factoryAddress?: Address;
  initCode?: Hex;
  initialOwner?: Address;
  entryPoint?: EntryPointDef<"0.7.0", Chain>;
  signerEntity?: SignerEntity;
};

export async function createSMAV2Account<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  config: CreateSMAV2AccountParams<TTransport, TSigner>
): Promise<MAV2Account<TSigner>>;

/**
 * Creates an SMAV2 account using defined parameters including chain, signer, salt, factory address, and more.
 * Handles account initialization code, nonce generation, transaction encoding, and more to construct a modular account with optional validation hooks.
 *
 * @param {CreateSMAV2AccountParams} config Configuration parameters for creating an SMAV2 account. Includes chain details, signer, salt, factory address, and more.
 * @returns {Promise<MAV2Account>} A promise that resolves to an `MAV2Account` providing methods for nonce retrieval, transaction execution, and more.
 */
export async function createSMAV2Account(
  config: CreateSMAV2AccountParams
): Promise<MAV2Account> {
  const {
    transport,
    chain,
    signer,
    salt = 0n,
    factoryAddress = getDefaultMAV2FactoryAddress(chain),
    initCode,
    initialOwner,
    accountAddress,
    entryPoint = getEntryPoint(chain, { version: "0.7.0" }),
    signerEntity,
  } = config;

  const client = createBundlerClient({
    transport,
    chain,
  });

  const getAccountInitCode = async () => {
    if (initCode) {
      return initCode;
    }

    // If an initial owner is not provided, use the signer's address
    const ownerAddress = initialOwner ?? (await signer.getAddress());

    return concatHex([
      factoryAddress,
      encodeFunctionData({
        abi: accountFactoryAbi,
        functionName: "createSemiModularAccount",
        args: [ownerAddress, salt],
      }),
    ]);
  };

  const _accountAddress = await getAccountAddress({
    client,
    entryPoint,
    accountAddress,
    getAccountInitCode,
  });

  return createMAv2Base({
    source: `SMAV2Account`,
    transport,
    chain,
    signer,
    entryPoint,
    accountAddress: _accountAddress,
    getAccountInitCode,
    signerEntity,
  });
}
