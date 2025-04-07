import { toHex, zeroAddress, type Address, type Hex } from "viem";
import {
  HookType,
  type HookConfig,
  type ValidationConfig,
} from "./actions/common/types.js";
import {
  installValidationActions,
  type InstallValidationParams,
} from "./actions/install-validation/installValidation.js";
import type { ModularAccountV2Client } from "./client/client.js";
import {
  deferralActions,
  type DeferredActionTypedData,
} from "./actions/deferralActions.js";
import { NativeTokenLimitModule } from "./modules/native-token-limit-module/module.js";
import {
  getDefaultAllowlistModuleAddress,
  getDefaultNativeTokenLimitModuleAddress,
  getDefaultSingleSignerValidationModuleAddress,
  getDefaultTimeRangeModuleAddress,
} from "./modules/utils.js";
import { SingleSignerValidationModule } from "./modules/single-signer-validation/module.js";
import { AllowlistModule } from "./modules/allowlist-module/module.js";
import { TimeRangeModule } from "./modules/time-range-module/module.js";

// We use this to offset the ERC20 spend limit entityId
const HALF_UINT32 = 2147483647;
const ERC20_APPROVE_SELECTOR = "0x095ea7b3";
const ERC20_TRANSFER_SELECTOR = "0xa9059cbb";
const ACCOUNT_EXECUTE_SELECTOR = "0xb61d27f6";
const ACCOUNT_EXECUTEBATCH_SELECTOR = "0x34fcd5be";

export enum PermissionType {
  NATIVE_TOKEN_TRANSFER = "native-token-transfer",
  ERC20_TOKEN_TRANSFER = "erc20-token-transfer",
  // ERC721_TOKEN_TRANSFER = "erc721-token-transfer", //Unimplemented
  // ERC1155_TOKEN_TRANSFER = "erc1155-token-transfer", //Unimplemented
  GAS_LIMIT = "gas-limit",
  // CALL_LIMIT = "call-limit", //Unimplemented
  // RATE_LIMIT = "rate-limit", //Unimplemented
  CONTRACT_ACCESS = "contract-access",
  ACCOUNT_FUNCTIONS = "account-functions",
  FUNCTIONS_ON_ALL_CONTRACTS = "functions-on-all-contracts",
  FUNCTIONS_ON_CONTRACT = "functions-on-contract",
  ROOT = "root",
}

enum HookIdentifier {
  NATIVE_TOKEN_TRANSFER,
  ERC20_TOKEN_TRANSFER,
  GAS_LIMIT,
  PREVAL_ALLOWLIST, // aggregate of CONTRACT_ACCESS, ACCOUNT_FUNCTIONS, FUNCTIONS_ON_ALL_CONTRACTS, FUNCTIONS_ON_CONTRACT
}

type PreExecutionHookConfig = {
  address: Address;
  entityId: number;
  hookType: HookType.EXECUTION;
  hasPreHooks: true;
  hasPostHooks: false;
};

type PreValidationHookConfig = {
  address: Address;
  entityId: number;
  hookType: HookType.VALIDATION;
  hasPreHooks: true;
  hasPostHooks: false;
};

type RawHooks = {
  [HookIdentifier.NATIVE_TOKEN_TRANSFER]:
    | {
        hookConfig: PreExecutionHookConfig;
        initData: {
          entityId: number;
          spendLimit: bigint;
        };
      }
    | undefined;
  [HookIdentifier.ERC20_TOKEN_TRANSFER]:
    | {
        hookConfig: PreExecutionHookConfig;
        initData: {
          entityId: number;
          inputs: Array<{
            target: Address;
            hasSelectorAllowlist: boolean;
            hasERC20SpendLimit: boolean;
            erc20SpendLimit: bigint;
            selectors: Array<Hex>;
          }>;
        };
      }
    | undefined;
  [HookIdentifier.GAS_LIMIT]:
    | {
        hookConfig: PreValidationHookConfig;
        initData: {
          entityId: number;
          spendLimit: bigint;
        };
      }
    | undefined;
  [HookIdentifier.PREVAL_ALLOWLIST]:
    | {
        hookConfig: PreValidationHookConfig;

        initData: {
          entityId: number;
          inputs: Array<{
            target: Address;
            hasSelectorAllowlist: boolean;
            hasERC20SpendLimit: boolean;
            erc20SpendLimit: bigint;
            selectors: Array<Hex>;
          }>;
        };
      }
    | undefined;
};

type OneOf<T extends {}[]> = T[number];

type Key = {
  publicKey: Hex;
  type: "secp256k1" | "contract";
};

export type Permission = OneOf<
  [
    {
      // this permission allows transfer of native tokens from the account
      type: PermissionType.NATIVE_TOKEN_TRANSFER;
      data: {
        allowance: Hex;
      };
    },
    {
      // this permission allows transfer or approval of erc20 tokens from the account
      type: PermissionType.ERC20_TOKEN_TRANSFER;
      data: {
        address: Address; // erc20 token contract address
        allowance: Hex;
      };
    },
    {
      // this permissions allows the key to spend gas for UOs
      type: PermissionType.GAS_LIMIT;
      data: {
        limit: Hex;
      };
    },
    {
      // this permission grants access to all functions in a contract
      type: PermissionType.CONTRACT_ACCESS;
      data: {
        address: Address;
      };
    },
    {
      // this permission grants access to functions in the account
      type: PermissionType.ACCOUNT_FUNCTIONS;
      data: {
        functions: Hex[]; // function signatures
      };
    },
    {
      // this permission grants access to a function selector in any address or contract
      type: PermissionType.FUNCTIONS_ON_ALL_CONTRACTS;
      data: {
        functions: Hex[]; // function signatures
      };
    },
    {
      // this permission grants access to specified functions on a specific contract
      type: PermissionType.FUNCTIONS_ON_CONTRACT;
      data: {
        address: Address;
        functions: Hex[];
      };
    },
    {
      // this permission grants full access to everything
      type: PermissionType.ROOT;
      data?: never;
    }
  ]
>;

type Hook = {
  hookConfig: HookConfig;
  initData: Hex;
};

export class PermissionBuilder {
  private client: ModularAccountV2Client;
  private validationConfig: ValidationConfig = {
    moduleAddress: zeroAddress,
    entityId: 0, // uint32
    isGlobal: false,
    isSignatureValidation: false,
    isUserOpValidation: false,
  };
  private selectors: Hex[] = [];
  private installData: Hex = "0x";
  private permissions: Permission[] = [];
  private hooks: Hook[] = [];
  private nonce: bigint = 0n;
  private hasAssociatedExecHooks: boolean = false;

  constructor(client: ModularAccountV2Client) {
    this.client = client;
  }

  // Configures the builder
  configure({
    key,
    entityId,
    nonce,
    selectors,
    hooks,
  }: {
    key: Key;
    entityId: number;
    nonce: bigint;
    selectors?: Hex[];
    hooks?: Hook[];
  }): this {
    this.validationConfig = {
      moduleAddress: getDefaultSingleSignerValidationModuleAddress(
        this.client.chain
      ),
      entityId,
      isUserOpValidation: true,
      isGlobal: false,
      isSignatureValidation: false,
    };
    this.installData = SingleSignerValidationModule.encodeOnInstallData({
      entityId: entityId,
      signer: key.publicKey,
    });
    if (selectors) this.selectors = selectors;
    if (hooks) this.hooks = hooks;
    this.nonce = nonce;
    return this;
  }

  addSelector({ selector }: { selector: Hex }): this {
    this.selectors.push(selector);
    return this;
  }

  addPermission({ permission }: { permission: Permission }): this {
    // Check 1: If we're adding root, we can't have any other permissions
    if (permission.type === PermissionType.ROOT) {
      if (this.permissions.length !== 0) {
        throw new Error(
          "PERMISSION: ROOT: Cannot add ROOT permission with other permissions"
        );
      }
      this.permissions.push(permission);
      // Set isGlobal to true
      this.validationConfig.isGlobal = true;
      return this;
    }

    // Check 2: If the permission is NOT ROOT (guaranteed), ensure there is no ROOT permission set
    // Will resolve to undefined if ROOT is not found
    // NOTE: Technically this could be replaced by checking permissions[0] since it should not be possible
    // to have >1 permission with root among them
    if (this.permissions.find((p) => p.type === PermissionType.ROOT)) {
      throw new Error(
        `PERMISSION: ${permission.type} => Cannot add permissions with ROOT enabled`
      );
    }

    // Check 3: If the permission is either CONTRACT_ACCESS or FUNCTIONS_ON_CONTRACT, ensure it doesn't collide with another like it.
    if (
      permission.type === PermissionType.CONTRACT_ACCESS ||
      permission.type === PermissionType.FUNCTIONS_ON_CONTRACT
    ) {
      // Check 3.1: address must not be the account address, or the user should use the ACCOUNT_FUNCTIONS permission
      if (permission.data.address === this.client.account.address) {
        throw new Error(
          `PERMISSION: ${permission.type} => Account address as target, use ACCOUNT_FUNCTIONS for account address`
        );
      }

      // Check 3.2: there must not be an existing permission with this address as a target
      const targetAddress = permission.data.address;
      const existingPermissionWithSameAddress = this.permissions.find(
        (p) =>
          (p.type === PermissionType.CONTRACT_ACCESS &&
            "address" in p.data &&
            p.data.address === targetAddress) ||
          (p.type === PermissionType.FUNCTIONS_ON_CONTRACT &&
            "address" in p.data &&
            p.data.address === targetAddress)
      );

      if (existingPermissionWithSameAddress) {
        throw new Error(
          `PERMISSION: ${permission.type} => Address ${targetAddress} already has a permission. Cannot add multiple CONTRACT_ACCESS or FUNCTIONS_ON_CONTRACT permissions for the same target address.`
        );
      }
    }

    // Check 4: If the permission is ACCOUNT_FUNCTIONS, add selectors
    if (permission.type === PermissionType.ACCOUNT_FUNCTIONS) {
      this.selectors = [...this.selectors, ...permission.data.functions];
      return this;
    }

    this.permissions.push(permission);

    return this;
  }

  addPermissions({ permissions }: { permissions: Permission[] }): this {
    // We could validate each permission here, but for simplicity we'll just add them
    // A better approach would be to call addPermission for each one
    permissions.forEach((permission) => {
      this.addPermission({ permission });
    });
    return this;
  }

  // Use for building deferred action typed data to sign
  async compileDeferred({
    deadline,
  }: {
    deadline: number;
    uoValidationEntityId: number;
    uoIsGlobalValidation: boolean;
  }): Promise<{
    typedData: DeferredActionTypedData;
    fullPreSignatureDeferredActionDigest: Hex;
  }> {
    // Need to remove this because compile_raw may add selectors
    // this.validateConfiguration();

    // Add time range module hook via expiry
    if (deadline !== 0) {
      if (deadline < Date.now() / 1000) {
        throw new Error(
          `PERMISSION: compile_deferred(): Deadline ${deadline} cannot be before now (${
            Date.now() / 1000
          })`
        );
      }
      this.hooks.push(
        TimeRangeModule.buildHook(
          {
            entityId: this.validationConfig.entityId, // will be timerange entityId
            validUntil: deadline,
            validAfter: 0,
          },
          getDefaultTimeRangeModuleAddress(this.client.chain)
        )
      );
    }

    const installValidationCall = await this.compile_raw();

    const { typedData } = await deferralActions(
      this.client
    ).createDeferredActionTypedDataObject({
      callData: installValidationCall,
      deadline: deadline,
      nonce: this.nonce,
    });

    const preSignatureDigest = deferralActions(
      this.client
    ).buildPreSignatureDeferredActionDigest({ typedData });

    // Encode additional information to build the full pre-signature digest
    const fullPreSignatureDeferredActionDigest: `0x${string}` = `0x00${
      this.hasAssociatedExecHooks ? "01" : "00"
    }${toHex(this.nonce, {
      size: 32,
    }).slice(2)}${preSignatureDigest.slice(2)}`;

    return {
      typedData,
      fullPreSignatureDeferredActionDigest,
    };
  }

  // Use for direct `installValidation()` low-level calls (maybe useless)
  async compileRaw(): Promise<Hex> {
    // Translate all permissions into raw hooks if >0
    if (this.permissions.length > 0) {
      const rawHooks = this.translatePermissions(
        this.validationConfig.entityId
      );
      // Add the translated permissions as hooks
      this.addHooks(rawHooks);
    }
    this.validateConfiguration();

    return await installValidationActions(this.client).encodeInstallValidation({
      validationConfig: this.validationConfig,
      selectors: this.selectors,
      installData: this.installData,
      hooks: this.hooks,
      account: this.client.account,
    });
  }

  // Use for compiling args to installValidation
  async compile_installArgs(): Promise<InstallValidationParams> {
    this.validateConfiguration();

    return {
      validationConfig: this.validationConfig,
      selectors: this.selectors,
      installData: this.installData,
      hooks: this.hooks,
      account: this.client.account,
    };
  }

  private validateConfiguration(): void {
    if (
      this.validationConfig.isGlobal === false &&
      this.selectors.length === 0
    ) {
      throw new Error(
        "Validation config unset, use permissionBuilder.configure(...)"
      );
    }
  }

  // Used to translate consolidated permissions into raw unencoded hooks
  // Note entityId will be a member object later
  private translatePermissions(entityId: number): RawHooks {
    const rawHooks: RawHooks = {
      [HookIdentifier.NATIVE_TOKEN_TRANSFER]: undefined,
      [HookIdentifier.ERC20_TOKEN_TRANSFER]: undefined,
      [HookIdentifier.GAS_LIMIT]: undefined,
      [HookIdentifier.PREVAL_ALLOWLIST]: undefined,
    };

    this.permissions.forEach((permission) => {
      switch (permission.type) {
        case PermissionType.NATIVE_TOKEN_TRANSFER:
          // Should never be added twice, check is on addPermission(s) too
          if (rawHooks[HookIdentifier.NATIVE_TOKEN_TRANSFER] !== undefined) {
            throw new Error(
              "PERMISSION: NATIVE_TOKEN_TRANSFER => Must have at most ONE native token transfer permission"
            );
          }
          rawHooks[HookIdentifier.NATIVE_TOKEN_TRANSFER] = {
            hookConfig: {
              address: getDefaultNativeTokenLimitModuleAddress(
                this.client.chain
              ),
              entityId,
              hookType: HookType.EXECUTION,
              hasPreHooks: true,
              hasPostHooks: false,
            },
            initData: {
              entityId,
              spendLimit: BigInt(permission.data.allowance),
            },
          };
          this.hasAssociatedExecHooks = true;
          break;
        case PermissionType.ERC20_TOKEN_TRANSFER:
          if (permission.data.address === zeroAddress) {
            throw new Error(
              "PERMISSION: ERC20_TOKEN_TRANSFER => Zero address provided"
            );
          }
          rawHooks[HookIdentifier.ERC20_TOKEN_TRANSFER] = {
            hookConfig: {
              address: getDefaultAllowlistModuleAddress(this.client.chain),
              entityId: entityId + HALF_UINT32,
              hookType: HookType.EXECUTION,
              hasPreHooks: true,
              hasPostHooks: false,
            },
            initData: {
              entityId: entityId + HALF_UINT32,
              inputs: [
                // Add previous inputs if they exist
                ...(rawHooks[HookIdentifier.ERC20_TOKEN_TRANSFER]?.initData
                  .inputs || []),
                {
                  target: permission.data.address,
                  hasSelectorAllowlist: false,
                  hasERC20SpendLimit: true,
                  erc20SpendLimit: BigInt(permission.data.allowance),
                  selectors: [],
                },
              ],
            },
          };
          this.hasAssociatedExecHooks = true;
          // Also allow `approve` and `transfer` for the erc20
          rawHooks[HookIdentifier.PREVAL_ALLOWLIST] = {
            hookConfig: {
              address: getDefaultAllowlistModuleAddress(this.client.chain),
              entityId,
              hookType: HookType.VALIDATION,
              hasPreHooks: true,
              hasPostHooks: false,
            },
            initData: {
              entityId,
              inputs: [
                // Add previous inputs if they exist
                ...(rawHooks[HookIdentifier.PREVAL_ALLOWLIST]?.initData
                  .inputs || []),
                {
                  target: permission.data.address,
                  hasSelectorAllowlist: true,
                  hasERC20SpendLimit: false,
                  erc20SpendLimit: 0n,
                  selectors: [ERC20_APPROVE_SELECTOR, ERC20_TRANSFER_SELECTOR], // approve, transfer
                },
              ],
            },
          };
          break;
        case PermissionType.GAS_LIMIT:
          // Should only ever be added once, check is also on addPermission(s)
          if (rawHooks[HookIdentifier.GAS_LIMIT] !== undefined) {
            throw new Error(
              "PERMISSION: GAS_LIMIT => Must have at most ONE gas limit permission"
            );
          }
          rawHooks[HookIdentifier.GAS_LIMIT] = {
            hookConfig: {
              address: getDefaultNativeTokenLimitModuleAddress(
                this.client.chain
              ),
              entityId,
              hookType: HookType.VALIDATION,
              hasPreHooks: true,
              hasPostHooks: false,
            },
            initData: {
              entityId,
              spendLimit: BigInt(permission.data.limit),
            },
          };
          break;
        case PermissionType.CONTRACT_ACCESS:
          if (permission.data.address === zeroAddress) {
            throw new Error(
              "PERMISSION: CONTRACT_ACCESS => Zero address provided"
            );
          }
          rawHooks[HookIdentifier.PREVAL_ALLOWLIST] = {
            hookConfig: {
              address: getDefaultAllowlistModuleAddress(this.client.chain),
              entityId,
              hookType: HookType.VALIDATION,
              hasPreHooks: true,
              hasPostHooks: false,
            },
            initData: {
              entityId,
              inputs: [
                // Add previous inputs if they exist
                ...(rawHooks[HookIdentifier.PREVAL_ALLOWLIST]?.initData
                  .inputs || []),
                {
                  target: permission.data.address,
                  hasSelectorAllowlist: false,
                  hasERC20SpendLimit: false,
                  erc20SpendLimit: 0n,
                  selectors: [],
                },
              ],
            },
          };
          break;
        case PermissionType.ACCOUNT_FUNCTIONS:
          if (permission.data.functions.length === 0) {
            throw new Error(
              "PERMISSION: ACCOUNT_FUNCTION => No functions provided"
            ); // should be in add perm
          }
          break;
        case PermissionType.FUNCTIONS_ON_ALL_CONTRACTS:
          if (permission.data.functions.length === 0) {
            throw new Error(
              "PERMISSION: FUNCTIONS_ON_ALL_CONTRACTS => No functions provided"
            );
          }
          rawHooks[HookIdentifier.PREVAL_ALLOWLIST] = {
            hookConfig: {
              address: getDefaultAllowlistModuleAddress(this.client.chain),
              entityId,
              hookType: HookType.VALIDATION,
              hasPreHooks: true,
              hasPostHooks: false,
            },
            initData: {
              entityId,
              inputs: [
                // Add previous inputs if they exist
                ...(rawHooks[HookIdentifier.PREVAL_ALLOWLIST]?.initData
                  .inputs || []),
                {
                  target: zeroAddress,
                  hasSelectorAllowlist: false,
                  hasERC20SpendLimit: false,
                  erc20SpendLimit: 0n,
                  selectors: permission.data.functions,
                },
              ],
            },
          };
          break;
        case PermissionType.FUNCTIONS_ON_CONTRACT:
          if (permission.data.functions.length === 0) {
            throw new Error(
              "PERMISSION: FUNCTIONS_ON_CONTRACT => No functions provided"
            );
          }
          if (permission.data.address === zeroAddress) {
            throw new Error(
              "PERMISSION: FUNCTIONS_ON_CONTRACT => Zero address provided"
            );
          }
          rawHooks[HookIdentifier.PREVAL_ALLOWLIST] = {
            hookConfig: {
              address: getDefaultAllowlistModuleAddress(this.client.chain),
              entityId,
              hookType: HookType.VALIDATION,
              hasPreHooks: true,
              hasPostHooks: false,
            },
            initData: {
              entityId,
              inputs: [
                // Add previous inputs if they exist
                ...(rawHooks[HookIdentifier.PREVAL_ALLOWLIST]?.initData
                  .inputs || []),
                {
                  target: permission.data.address,
                  hasSelectorAllowlist: true,
                  hasERC20SpendLimit: false,
                  erc20SpendLimit: 0n,
                  selectors: permission.data.functions,
                },
              ],
            },
          };
          break;
        case PermissionType.ROOT:
          // Root permission handled in addPermission
          break;
        default:
          throw new Error(
            `Unsupported permission type: ${(permission as any).type}`
          );
      }

      // isGlobal guaranteed to be false since it's only set with root permissions,
      // we must add access to execute & executeBatch if there's a preVal allowlist hook set.
      if (rawHooks[HookIdentifier.PREVAL_ALLOWLIST] !== undefined) {
        const selectorsToAdd: `0x${string}`[] = [
          ACCOUNT_EXECUTE_SELECTOR,
          ACCOUNT_EXECUTEBATCH_SELECTOR,
        ]; // execute, executeBatch

        // Only add the selectors if they aren't already in this.selectors
        const newSelectors = selectorsToAdd.filter(
          (selector) => !this.selectors.includes(selector)
        );

        this.selectors = [...this.selectors, ...newSelectors];
      }
    });

    return rawHooks;
  }

  private addHooks(rawHooks: RawHooks) {
    if (rawHooks[HookIdentifier.NATIVE_TOKEN_TRANSFER]) {
      this.hooks.push({
        hookConfig: rawHooks[HookIdentifier.NATIVE_TOKEN_TRANSFER].hookConfig,
        initData: NativeTokenLimitModule.encodeOnInstallData(
          rawHooks[HookIdentifier.NATIVE_TOKEN_TRANSFER].initData
        ),
      });
    }

    if (rawHooks[HookIdentifier.ERC20_TOKEN_TRANSFER]) {
      this.hooks.push({
        hookConfig: rawHooks[HookIdentifier.ERC20_TOKEN_TRANSFER].hookConfig,
        initData: AllowlistModule.encodeOnInstallData(
          rawHooks[HookIdentifier.ERC20_TOKEN_TRANSFER].initData
        ),
      });
    }

    if (rawHooks[HookIdentifier.GAS_LIMIT]) {
      this.hooks.push({
        hookConfig: rawHooks[HookIdentifier.GAS_LIMIT].hookConfig,
        initData: NativeTokenLimitModule.encodeOnInstallData(
          rawHooks[HookIdentifier.GAS_LIMIT].initData
        ),
      });
    }

    if (rawHooks[HookIdentifier.PREVAL_ALLOWLIST]) {
      this.hooks.push({
        hookConfig: rawHooks[HookIdentifier.PREVAL_ALLOWLIST].hookConfig,
        initData: AllowlistModule.encodeOnInstallData(
          rawHooks[HookIdentifier.PREVAL_ALLOWLIST].initData
        ),
      });
    }
  }
}
