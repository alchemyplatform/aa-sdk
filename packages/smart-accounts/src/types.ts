import type {
  Abi,
  Address,
  Hex,
  IsUndefined,
  SignableMessage,
  TypedDataDefinition,
} from "viem";
import type { EntryPointVersion, SmartAccount } from "viem/account-abstraction";

export type GetAccountParameter<
  TAccount extends SmartAccount | undefined = SmartAccount | undefined,
  TAccountOverride extends SmartAccount = SmartAccount,
> =
  IsUndefined<TAccount> extends true
    ? { account: TAccountOverride }
    : { account?: TAccountOverride };

export type SignatureRequest =
  | {
      type: "personal_sign";
      data: SignableMessage;
    }
  | {
      type: "eth_signTypedData_v4";
      data: TypedDataDefinition;
    };

export type StaticSmartAccountImplementation<
  eip7702 extends boolean = boolean,
  entryPointVersion extends EntryPointVersion = EntryPointVersion,
  factoryArgs extends {} = {},
  entryPointAbi extends Abi | readonly unknown[] = Abi,
  accountAbi extends Abi | readonly unknown[] = Abi,
  factoryAbi extends Abi | readonly unknown[] = Abi,
> = {
  readonly entryPoint: {
    readonly abi: entryPointAbi;
    readonly address: Address;
    readonly version: entryPointVersion;
  };
  readonly accountAbi: accountAbi;
} & (eip7702 extends false
  ? {
      // Smart contract account specific fields
      readonly accountImplementation: Address;
      readonly getFactoryData: (factoryArgs: factoryArgs) => Hex;
      readonly predictAccountAddress: (factoryArgs: factoryArgs) => Address;
      readonly factoryAddress: Address;
      readonly factoryAbi: factoryAbi;
    }
  : {}) &
  (eip7702 extends true
    ? {
        // EIP-7702 account specific fields
        readonly delegationAddress: Address;
      }
    : {});
