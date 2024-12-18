import type {
  EntryPointDef,
  SmartAccountSigner,
  ToSmartContractAccountParams,
} from "@aa-sdk/core";
import {
  getEntryPoint,
  toSmartContractAccount,
  EntityIdOverrideError,
} from "@aa-sdk/core";
import { type Chain, type Hex, type Transport } from "viem";
import { DEFAULT_OWNER_ENTITY_ID } from "../utils.js";
import { singleSignerMessageSigner } from "../modules/single-signer-validation/signer.js";
import { nativeSMASigner } from "./nativeSMASigner.js";
import {
  type SignerEntity,
  type MAV2Account,
  createMAv2BaseFunctions,
} from "./common/modularAccountV2Base.js";

export type CreateSMA7702AccountParams<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = Pick<
  ToSmartContractAccountParams<"MAV2Account", TTransport, Chain, "0.7.0">,
  "transport" | "chain" | "accountAddress"
> & {
  signer: TSigner;
  entryPoint?: EntryPointDef<"0.7.0", Chain>;
  signerEntity?: SignerEntity;
};

export async function createSMA7702Account<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  config: CreateSMA7702AccountParams<TTransport, TSigner>
): Promise<MAV2Account<TSigner>>;

/**
 * Creates an SMAV2 account using defined parameters including chain, signer, salt, factory address, and more.
 * Handles account initialization code, nonce generation, transaction encoding, and more to construct a modular account with optional validation hooks.
 *
 * @param {CreateSMA7702ccountParams} config Configuration parameters for creating an SMAV2 account. Includes chain details, signer, salt, factory address, and more.
 * @returns {Promise<MAV2Account>} A promise that resolves to an `MAV2Account` providing methods for nonce retrieval, transaction execution, and more.
 */
export async function createSMA7702Account(
  config: CreateSMA7702AccountParams
): Promise<MAV2Account> {
  const {
    transport,
    chain,
    signer,
    accountAddress,
    entryPoint = getEntryPoint(chain, { version: "0.7.0" }),
    signerEntity = {
      isGlobalValidation: true,
      entityId: DEFAULT_OWNER_ENTITY_ID,
    },
    signerEntity: { entityId = DEFAULT_OWNER_ENTITY_ID } = {},
  } = config;

  const getAccountInitCode = async (): Promise<Hex> => {
    return "0x";
  };

  const signerAddress = await signer.getAddress();

  // Account address is either loaded from the parameter, or inferred as the signer address (due to 7702)
  const _accountAddress = accountAddress ?? signerAddress;

  if (
    entityId === DEFAULT_OWNER_ENTITY_ID &&
    signerAddress !== _accountAddress
  ) {
    throw new EntityIdOverrideError();
  }

  const { encodeExecute, encodeBatchExecute, ...baseFunctions } =
    await createMAv2BaseFunctions({
      transport,
      chain,
      entryPoint,
      signerEntity,
      accountAddress: _accountAddress,
    });

  const baseAccount = await toSmartContractAccount({
    transport,
    chain,
    entryPoint,
    accountAddress: _accountAddress,
    source: `MAV2Account`,
    encodeExecute,
    encodeBatchExecute,
    getAccountInitCode,
    ...(entityId === DEFAULT_OWNER_ENTITY_ID
      ? nativeSMASigner(signer, chain, _accountAddress)
      : singleSignerMessageSigner(signer, chain, _accountAddress, entityId)),
  });

  return {
    ...baseAccount,
    ...baseFunctions,
    getSigner: () => signer,
    signerEntity,
  };
}
