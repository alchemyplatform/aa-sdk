import type {
  EntryPointDef,
  SmartAccountSigner,
  ToSmartContractAccountParams,
} from "@aa-sdk/core";
import {
  createBundlerClient,
  getEntryPoint,
  getAccountAddress,
  EntityIdOverrideError,
  InvalidMAV2AccountType,
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
import { DEFAULT_OWNER_ENTITY_ID } from "../utils.js";

export type CreateSMAV2BytecodeAccountParams<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = Pick<
  ToSmartContractAccountParams<"MAV2Account", TTransport, Chain, "0.7.0">,
  "transport" | "chain" | "accountAddress"
> & {
  type?: "default";
  signer: TSigner;
  salt?: bigint;
  factoryAddress?: Address;
  initCode?: Hex;
  entryPoint?: EntryPointDef<"0.7.0", Chain>;
  signerEntity?: SignerEntity;
};

export type CreateSMA7702AccountParams<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = Pick<
  ToSmartContractAccountParams<"MAV2Account", TTransport, Chain, "0.7.0">,
  "transport" | "chain"
> &
  Partial<
    Pick<
      ToSmartContractAccountParams<"MAV2Account", TTransport, Chain, "0.7.0">,
      "accountAddress"
    >
  > & {
    type: "7702";
    signer: TSigner;
    entryPoint?: EntryPointDef<"0.7.0", Chain>;
    signerEntity?: SignerEntity;
  };

export type CreateModularAccountV2Params<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner
> =
  | CreateSMA7702AccountParams<TTransport, TSigner>
  | CreateSMAV2BytecodeAccountParams<TTransport, TSigner>;

export async function createModularAccountV2<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  config: CreateModularAccountV2Params<TTransport, TSigner>
): Promise<MAV2Account<TSigner>>;

/**
 * Creates a specific MAV2 account type depending on the provided "type" field and other defined parameters.
 * Possible types include: "default", which is SMA Bytecode, and "7702".
 * Handles nonce generation, transaction encoding, and more to construct a modular account with optional validation hooks.
 *
 * @param {CreateModularAccountV2Params} config Configuration parameters for creating an MAV2 account.
 * @returns {Promise<MAV2Account>} A promise that resolves to an `MAV2Account` providing methods for nonce retrieval, transaction execution, and more.
 */
export async function createModularAccountV2(
  config: CreateModularAccountV2Params
): Promise<MAV2Account> {
  const {
    type = "default",
    transport,
    chain,
    signer,
    accountAddress: _accountAddress,
    entryPoint = getEntryPoint(chain, { version: "0.7.0" }),
    signerEntity = {
      isGlobalValidation: true,
      entityId: DEFAULT_OWNER_ENTITY_ID,
    },
    signerEntity: { entityId = DEFAULT_OWNER_ENTITY_ID } = {},
  } = config;

  const client = createBundlerClient({
    transport,
    chain,
  });

  const accountFunctions = await (async () => {
    switch (type) {
      case "7702": {
        const getAccountInitCode = async (): Promise<Hex> => {
          return "0x";
        };
        const signerAddress = await signer.getAddress();
        const accountAddress = _accountAddress ?? signerAddress;
        if (
          entityId === DEFAULT_OWNER_ENTITY_ID &&
          signerAddress !== accountAddress
        ) {
          throw new EntityIdOverrideError();
        }

        const implementation: Address =
          "0x69007702764179f14F51cdce752f4f775d74E139";

        const getImplementationAddress = async () => implementation;

        return {
          source: `SMAV27702Account`,
          getAccountInitCode,
          accountAddress,
          getImplementationAddress,
        };
      }
      case "default": {
        const {
          salt = 0n,
          factoryAddress = getDefaultMAV2FactoryAddress(chain),
          initCode,
        } = config as CreateSMAV2BytecodeAccountParams;

        const getAccountInitCode = async () => {
          if (initCode) {
            return initCode;
          }

          return concatHex([
            factoryAddress,
            encodeFunctionData({
              abi: accountFactoryAbi,
              functionName: "createSemiModularAccount",
              args: [await signer.getAddress(), salt],
            }),
          ]);
        };

        const accountAddress = await getAccountAddress({
          client,
          entryPoint,
          accountAddress: _accountAddress,
          getAccountInitCode,
        });

        return {
          source: `SMAV2BytecodeAccount`,
          getAccountInitCode,
          accountAddress,
        };
      }
      default:
        throw new InvalidMAV2AccountType(type);
    }
  })();

  return createMAv2Base({
    transport,
    chain,
    signer,
    entryPoint,
    signerEntity,
    ...accountFunctions,
  });
}
