import {
  FailedToGetStorageSlotError,
  createBundlerClient,
  toSmartContractAccount,
  type Abi,
  type EntryPointDef,
  type SmartAccountSigner,
  type SmartContractAccountWithSigner,
  type ToSmartContractAccountParams,
  type UpgradeToAndCallParams,
} from "@aa-sdk/core";
import {
  concat,
  encodeFunctionData,
  fromHex,
  hashMessage,
  hashTypedData,
  trim,
  type Address,
  type Chain,
  type Hex,
  type SignTypedDataParameters,
  type Transport,
} from "viem";
import type {
  LightAccountEntryPointVersion,
  LightAccountType,
  LightAccountVersion,
} from "../types.js";
import { AccountVersionRegistry } from "../utils.js";

enum SignatureType {
  EOA = "0x00",
  CONTRACT = "0x01",
  CONTRACT_WITH_ADDR = "0x02",
}

export type LightAccountBase<
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TLightAccountType extends LightAccountType = LightAccountType,
  TLightAccountVersion extends LightAccountVersion<TLightAccountType> = LightAccountVersion<TLightAccountType>
> = SmartContractAccountWithSigner<
  TLightAccountType,
  TSigner,
  LightAccountEntryPointVersion<TLightAccountType, TLightAccountVersion>
> & {
  getLightAccountVersion: () => TLightAccountVersion;
};

//#region CreateLightAccountBaseParams
export type CreateLightAccountBaseParams<
  TLightAccountType extends LightAccountType,
  TLightAccountVersion extends LightAccountVersion<TLightAccountType> = LightAccountVersion<TLightAccountType>,
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = Pick<
  ToSmartContractAccountParams<TLightAccountType, TTransport, Chain>,
  "transport" | "chain" | "getAccountInitCode"
> & {
  abi: Abi;
  signer: TSigner;
  accountAddress: Address;
  type: TLightAccountType;
  version: TLightAccountVersion;
  entryPoint: EntryPointDef<
    LightAccountEntryPointVersion<TLightAccountType, TLightAccountVersion>,
    Chain
  >;
};
//#endregion CreateLightAccountBaseParams

export async function createLightAccountBase<
  TLightAccountType extends LightAccountType,
  TLightAccountVersion extends LightAccountVersion<TLightAccountType>,
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner
>({
  transport,
  chain,
  signer,
  abi,
  version,
  type,
  entryPoint,
  accountAddress,
  getAccountInitCode,
}: CreateLightAccountBaseParams<
  TLightAccountType,
  TLightAccountVersion,
  TTransport,
  TSigner
>): Promise<
  LightAccountBase<TSigner, TLightAccountType, TLightAccountVersion>
> {
  const client = createBundlerClient({
    transport,
    chain,
  });

  const encodeUpgradeToAndCall = async ({
    upgradeToAddress,
    upgradeToInitData,
  }: UpgradeToAndCallParams): Promise<Hex> => {
    const storage = await client.getStorageAt({
      address: accountAddress,
      // the slot at which impl addresses are stored by UUPS
      slot: "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc",
    });

    if (storage == null) {
      throw new FailedToGetStorageSlotError(
        "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc",
        "Proxy Implementation Address"
      );
    }

    const implementationAddresses = Object.values(
      AccountVersionRegistry[type]
    ).map(
      (x) => x.addresses.overrides?.[chain.id]?.impl ?? x.addresses.default.impl
    );

    // only upgrade undeployed accounts (storage 0) or deployed light accounts, error otherwise
    if (
      fromHex(storage, "number") !== 0 &&
      !implementationAddresses.some((x) => x === trim(storage))
    ) {
      throw new Error(
        `could not determine if smart account implementation is ${type} ${String(
          version
        )}`
      );
    }

    return encodeFunctionData({
      abi,
      functionName: "upgradeToAndCall",
      args: [upgradeToAddress, upgradeToInitData],
    });
  };

  const signWith1271Wrapper = async (
    hashedMessage: Hex,
    version: string
  ): Promise<Hex> => {
    return signer.signTypedData({
      // EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)
      // https://github.com/alchemyplatform/light-account/blob/main/src/LightAccount.sol#L236
      domain: {
        chainId: Number(client.chain.id),
        name: type,
        verifyingContract: accountAddress,
        version,
      },
      types: {
        LightAccountMessage: [{ name: "message", type: "bytes" }],
      },
      message: {
        message: hashedMessage,
      },
      primaryType: "LightAccountMessage",
    });
  };

  const account = await toSmartContractAccount({
    transport,
    chain,
    entryPoint,
    accountAddress,
    source: type,
    getAccountInitCode,
    encodeExecute: async ({ target, data, value }) => {
      return encodeFunctionData({
        abi,
        functionName: "execute",
        args: [target, value ?? 0n, data],
      });
    },
    encodeBatchExecute: async (txs) => {
      const [targets, values, datas] = txs.reduce(
        (accum, curr) => {
          accum[0].push(curr.target);
          accum[1].push(curr.value ?? 0n);
          accum[2].push(curr.data);

          return accum;
        },
        [[], [], []] as [Address[], bigint[], Hex[]]
      );
      return encodeFunctionData({
        abi,
        functionName: "executeBatch",
        args: [targets, values, datas],
      });
    },
    signUserOperationHash: async (uoHash: Hex) => {
      const signature = await signer.signMessage({ raw: uoHash });
      switch (version) {
        case "v2.0.0":
          // TODO: handle case where signer is an SCA.
          return concat([SignatureType.EOA, signature]);
        default:
          return signature;
      }
    },
    async signMessage({ message }) {
      switch (version as string) {
        case "v1.0.1":
          return signer.signMessage(message);
        case "v1.0.2":
          throw new Error(`${type} ${String(version)} doesn't support 1271`);
        case "v1.1.0":
          return signWith1271Wrapper(hashMessage(message), "1");
        case "v2.0.0":
          const signature = await signWith1271Wrapper(
            hashMessage(message),
            "2"
          );
          // TODO: handle case where signer is an SCA.
          return concat([SignatureType.EOA, signature]);
        default:
          throw new Error(`Unknown version ${type} of ${String(version)}`);
      }
    },
    async signTypedData(params) {
      switch (version as string) {
        case "v1.0.1":
          return signer.signTypedData(
            params as unknown as SignTypedDataParameters
          );
        case "v1.0.2":
          throw new Error(
            `Version ${String(version)} of LightAccount doesn't support 1271`
          );
        case "v1.1.0":
          return signWith1271Wrapper(hashTypedData(params), "1");
        case "v2.0.0":
          const signature = await signWith1271Wrapper(
            hashTypedData(params),
            "2"
          );
          // TODO: handle case where signer is an SCA.
          return concat([SignatureType.EOA, signature]);
        default:
          throw new Error(`Unknown version ${String(version)} of LightAccount`);
      }
    },
    getDummySignature: (): Hex => {
      const signature =
        "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c";
      switch (version as string) {
        case "v1.0.1":
        case "v1.0.2":
        case "v1.1.0":
          return signature;
        case "v2.0.0":
          return concat([SignatureType.EOA, signature]);
        default:
          throw new Error(`Unknown version ${type} of ${String(version)}`);
      }
    },
    encodeUpgradeToAndCall,
  });

  return {
    ...account,
    source: type,
    getLightAccountVersion: () => version,
    getSigner: () => signer,
  };
}
