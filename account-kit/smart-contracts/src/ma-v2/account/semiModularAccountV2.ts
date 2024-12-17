import type {
  EntryPointDef,
  SmartAccountSigner,
  SmartContractAccountWithSigner,
  ToSmartContractAccountParams,
} from "@aa-sdk/core";
import {
  createBundlerClient,
  getEntryPoint,
  toSmartContractAccount,
  getAccountAddress,
} from "@aa-sdk/core";
import {
  concatHex,
  encodeFunctionData,
  getContract,
  maxUint32,
  toHex,
  type Address,
  type Chain,
  type Hex,
  type Transport,
  hexToBigInt,
} from "viem";
import { accountFactoryAbi } from "../abis/accountFactoryAbi.js";
import { getDefaultMAV2FactoryAddress } from "../utils.js";
import { standardExecutor } from "../../msca/account/standardExecutor.js";
import { singleSignerMessageSigner } from "../modules/single-signer-validation/signer.js";
import { InvalidEntityIdError, InvalidNonceKeyError } from "@aa-sdk/core";

export const DEFAULT_OWNER_ENTITY_ID = 0;

export type SMAV2Account<
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = SmartContractAccountWithSigner<"SMAV2Account", TSigner, "0.7.0">;

export type CreateSMAV2AccountParams<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = Pick<
  ToSmartContractAccountParams<"SMAV2Account", TTransport, Chain, "0.7.0">,
  "transport" | "chain" | "accountAddress"
> & {
  signer: TSigner;
  salt?: bigint;
  factoryAddress?: Address;
  initCode?: Hex;
  initialOwner?: Address;
  entryPoint?: EntryPointDef<"0.7.0", Chain>;
} & (
    | {
        isGlobalValidation: boolean;
        entityId: number;
      }
    | {
        isGlobalValidation?: never;
        entityId?: never;
      }
  );

export async function createSMAV2Account<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  config: CreateSMAV2AccountParams<TTransport, TSigner>
): Promise<SMAV2Account<TSigner>>;

export async function createSMAV2Account(
  config: CreateSMAV2AccountParams
): Promise<SMAV2Account> {
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
    isGlobalValidation = true,
    entityId = 0,
  } = config;

  if (entityId >= Number(maxUint32)) {
    throw new InvalidEntityIdError(entityId);
  }

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

  const baseAccount = await toSmartContractAccount({
    transport,
    chain,
    entryPoint,
    accountAddress,
    source: `SMAV2Account`,
    getAccountInitCode,
    ...standardExecutor,
    ...singleSignerMessageSigner(signer),
  });

  // TODO: add deferred action flag
  const getAccountNonce = async (nonceKey?: bigint): Promise<bigint> => {
    const nonceKeySuffix: Hex = `${toHex(entityId, { size: 4 })}${
      isGlobalValidation ? "01" : "00"
    }`;

    if (nonceKey && toHex(nonceKey, { size: 5 }) !== nonceKeySuffix) {
      throw new InvalidNonceKeyError(nonceKey, hexToBigInt(nonceKeySuffix));
    }

    const entryPointContract = getContract({
      address: entryPoint.address,
      abi: entryPoint.abi,
      client,
    });

    return entryPointContract.read.getNonce([
      baseAccount.address,
      nonceKey ?? hexToBigInt(nonceKeySuffix),
    ]) as Promise<bigint>;
  };

  return {
    ...baseAccount,
    getAccountNonce,
    getSigner: () => signer,
  };
}
