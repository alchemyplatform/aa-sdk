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
  InvalidModularAccountV2Mode,
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
  type ModularAccountV2,
  createMAv2Base,
} from "./common/modularAccountV2Base.js";
import { DEFAULT_OWNER_ENTITY_ID } from "../utils.js";

export type CreateModularAccountV2Params<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = (Pick<
  ToSmartContractAccountParams<"ModularAccountV2", TTransport, Chain, "0.7.0">,
  "transport" | "chain" | "accountAddress"
> & {
  signer: TSigner;
  entryPoint?: EntryPointDef<"0.7.0", Chain>;
  deferredAction?: Hex;
  signerEntity?: SignerEntity;
}) &
  (
    | {
        mode?: "default";
        salt?: bigint;
        factoryAddress?: Address;
        initCode?: Hex;
      }
    | {
        mode: "7702";
      }
  );

export async function createModularAccountV2<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  config: CreateModularAccountV2Params<TTransport, TSigner>
): Promise<ModularAccountV2<TSigner>>;

/**
 * Creates a ModularAccount V2 account, with the mode depending on the provided "mode" field.
 * Possible modes include: "default", which is SMA Bytecode, and "7702", which is SMA 7702.
 * Handles nonce generation, transaction encoding, and mode variant-specific behavior like initcode construction.
 *
 * @example
 * ```ts twoslash
 * import { createModularAccountV2 } from "@account-kit/smart-contracts";
 * import { LocalAccountSigner } from "@aa-sdk/core";
 * import { alchemy, sepolia } from "@account-kit/infra";
 *
 * const MNEMONIC = "...";
 * const RPC_URL = "...";
 *
 * const signer = LocalAccountSigner.mnemonicToAccountSigner(MNEMONIC);
 *
 * const chain = sepolia;
 *
 * const transport = alchemy({ rpcUrl: RPC_URL });
 *
 *
 * const modularAccountV2 = await createModularAccountV2({
 *  mode: "default", // or "7702"
 *  chain,
 *  signer,
 *  transport,
 * });
 * ```
 *
 * @param {CreateModularAccountV2Params} config Configuration parameters for creating a Modular Account V2.
 * @returns {Promise<ModularAccountV2>} A promise that resolves to an `ModularAccountV2` providing methods for nonce retrieval, transaction execution, and more.
 */
export async function createModularAccountV2(
  config: CreateModularAccountV2Params
): Promise<ModularAccountV2> {
  const {
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
    deferredAction,
  } = config;

  const client = createBundlerClient({
    transport,
    chain,
  });

  const accountFunctions = await (async () => {
    switch (config.mode) {
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
          getAccountInitCode,
          accountAddress,
          getImplementationAddress,
        };
      }
      case "default":
      case undefined: {
        const {
          salt = 0n,
          factoryAddress = getDefaultMAV2FactoryAddress(chain),
          initCode,
        } = config;

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
          getAccountInitCode,
          accountAddress,
        };
      }
      default:
        assertNever(config);
    }
  })();

  return createMAv2Base({
    source: "ModularAccountV2",
    transport,
    chain,
    signer,
    entryPoint,
    signerEntity,
    deferredAction,
    ...accountFunctions,
  });
}

// If we add more valid modes, the switch case branch's mode will no longer be `never`, which will cause a compile time error here and ensure we handle the new type.
function assertNever(_valid: never): never {
  throw new InvalidModularAccountV2Mode();
}
