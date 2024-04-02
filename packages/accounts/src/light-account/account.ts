import type {
  DefaultEntryPointVersion,
  EntryPointDef,
  EntryPointVersion,
  HttpTransport,
  OneOf,
} from "@alchemy/aa-core";
import {
  FailedToGetStorageSlotError,
  LocalAccountSigner,
  createBundlerClient,
  getAccountAddress,
  getEntryPoint,
  sepolia,
  toSmartContractAccount,
  type Address,
  type SmartAccountSigner,
  type SmartContractAccountWithSigner,
  type ToSmartContractAccountParams,
  type UpgradeToAndCallParams,
} from "@alchemy/aa-core";
import {
  concatHex,
  encodeFunctionData,
  fromHex,
  hashMessage,
  hashTypedData,
  http,
  trim,
  type Chain,
  type Hex,
  type PrivateKeyAccount,
  type SignTypedDataParameters,
  type Transport,
} from "viem";
import { generatePrivateKey } from "viem/accounts";
import { LightAccountAbi } from "./abis/LightAccountAbi.js";
import { LightAccountFactoryAbi } from "./abis/LightAccountFactoryAbi.js";
import {
  LightAccountUnsupported1271Factories,
  LightAccountVersions,
  getDefaultLightAccountFactoryAddress,
  getLightAccountVersion,
  type LightAccountVersion,
} from "./utils.js";

export type LightAccount<
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion
> = SmartContractAccountWithSigner<
  "LightAccount",
  TSigner,
  TEntryPointVersion
> & {
  getLightAccountVersion: () => Promise<LightAccountVersion>;
  encodeTransferOwnership: (newOwner: Address) => Hex;
  getOwnerAddress: () => Promise<Address>;
};

export type CreateLightAccountParams<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TEntryPointVersion extends EntryPointVersion = DefaultEntryPointVersion
> = Pick<
  ToSmartContractAccountParams<
    "LightAccount",
    TTransport,
    Chain,
    TEntryPointVersion
  >,
  "transport" | "chain"
> & {
  signer: TSigner;
  salt?: bigint;
  accountAddress?: Address;
  factoryAddress?: Address;
  initCode?: Hex;
  version?: LightAccountVersion;
} & (OneOf<TEntryPointVersion, TEntryPointVersion> extends never
    ? { entryPoint: never; version?: never }
    : TEntryPointVersion extends "0.6.0"
    ? {
        entryPoint?: EntryPointDef<TEntryPointVersion, Chain>;
        version?: Extract<LightAccountVersion, `v1${string}`>;
      }
    : TEntryPointVersion extends "0.7.0"
    ? {
        entryPoint: EntryPointDef<TEntryPointVersion, Chain>;
        version: Exclude<LightAccountVersion, `v1${string}`>;
      }
    : { entryPoint?: never; version?: never });

export async function createLightAccount<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TEntryPointVersion extends EntryPointVersion = DefaultEntryPointVersion
>(
  config: CreateLightAccountParams<TTransport, TSigner, TEntryPointVersion>
): Promise<LightAccount<TSigner, TEntryPointVersion>>;

export async function createLightAccount({
  transport,
  chain,
  signer,
  initCode,
  version = "v1.1.0",
  entryPoint = getEntryPoint(chain),
  accountAddress,
  factoryAddress = getDefaultLightAccountFactoryAddress(chain, version),
  salt: salt_ = 0n,
}: CreateLightAccountParams): Promise<LightAccount> {
  const client = createBundlerClient({
    transport,
    chain,
  });

  const getAccountInitCode = async () => {
    if (initCode) return initCode;

    const salt = LightAccountUnsupported1271Factories.has(
      factoryAddress.toLowerCase() as Address
    )
      ? 0n
      : salt_;

    return concatHex([
      factoryAddress,
      encodeFunctionData({
        abi: LightAccountFactoryAbi,
        functionName: "createAccount",
        args: [await signer.getAddress(), salt],
      }),
    ]);
  };

  const address = await getAccountAddress({
    client,
    entryPoint,
    accountAddress,
    getAccountInitCode,
  });

  const encodeUpgradeToAndCall = async ({
    upgradeToAddress,
    upgradeToInitData,
  }: UpgradeToAndCallParams): Promise<Hex> => {
    const storage = await client.getStorageAt({
      address,
      // the slot at which impl addresses are stored by UUPS
      slot: "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc",
    });

    if (storage == null) {
      throw new FailedToGetStorageSlotError(
        "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc",
        "Proxy Implementation Address"
      );
    }

    const implementationAddresses = Object.values(LightAccountVersions).map(
      (x) => x.implAddress
    );

    // only upgrade undeployed accounts (storage 0) or deployed light accounts, error otherwise
    if (
      fromHex(storage, "number") !== 0 &&
      !implementationAddresses.some((x) => x === trim(storage))
    ) {
      throw new Error(
        "could not determine if smart account implementation is light account"
      );
    }

    return encodeFunctionData({
      abi: LightAccountAbi,
      functionName: "upgradeToAndCall",
      args: [upgradeToAddress, upgradeToInitData],
    });
  };

  const signWith1271Wrapper = async (msg: Hex): Promise<`0x${string}`> => {
    return signer.signTypedData({
      // EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)
      // https://github.com/alchemyplatform/light-account/blob/main/src/LightAccount.sol#L236
      domain: {
        chainId: Number(client.chain.id),
        name: "LightAccount",
        verifyingContract: address,
        version: "1",
      },
      types: {
        LightAccountMessage: [{ name: "message", type: "bytes" }],
      },
      message: {
        message: msg,
      },
      primaryType: "LightAccountMessage",
    });
  };

  const account = await toSmartContractAccount({
    transport,
    chain,
    entryPoint,
    accountAddress: address,
    source: "LightAccount",
    getAccountInitCode,
    encodeExecute: async ({ target, data, value }) => {
      return encodeFunctionData({
        abi: LightAccountAbi,
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
        abi: LightAccountAbi,
        functionName: "executeBatch",
        args: [targets, values, datas],
      });
    },
    signUserOperationHash: async (uoHash: Hex) => {
      return signer.signMessage({ raw: uoHash });
    },
    async signMessage({ message }) {
      const version = await getLightAccountVersion(account!);
      switch (version) {
        case "v1.0.1":
          return signer.signMessage(message);
        case "v1.0.2":
          throw new Error(
            `Version ${version} of LightAccount doesn't support 1271`
          );
        default:
          return signWith1271Wrapper(hashMessage(message));
      }
    },
    async signTypedData(params) {
      const version = await getLightAccountVersion(account!);
      switch (version) {
        case "v1.0.1": {
          return signer.signTypedData(
            params as unknown as SignTypedDataParameters
          );
        }
        case "v1.0.2":
          throw new Error(
            `Version ${version} of LightAccount doesn't support 1271`
          );
        default:
          return signWith1271Wrapper(hashTypedData(params));
      }
    },
    getDummySignature: () => {
      return "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c";
    },
    encodeUpgradeToAndCall,
  });

  return {
    ...account,
    source: "LightAccount",
    getLightAccountVersion: async () => getLightAccountVersion(account),
    encodeTransferOwnership: (newOwner: Address) => {
      return encodeFunctionData({
        abi: LightAccountAbi,
        functionName: "transferOwnership",
        args: [newOwner],
      });
    },
    async getOwnerAddress(): Promise<Address> {
      const callResult = await client.readContract({
        address,
        abi: LightAccountAbi,
        functionName: "owner",
      });

      if (callResult == null) {
        throw new Error("could not get on-chain owner");
      }

      if (callResult !== (await signer.getAddress())) {
        throw new Error("on-chain owner does not match account owner");
      }

      return callResult;
    },
    getSigner: () => signer,
  };
}

const lightAccount06: LightAccount<
  LocalAccountSigner<PrivateKeyAccount>,
  "0.6.0"
> = await createLightAccount({
  entryPoint: getEntryPoint(sepolia),
  transport: http(),
  chain: sepolia,
  signer: LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey()),
});

const lightAccountOther = await createLightAccount<
  HttpTransport,
  SmartAccountSigner,
  EntryPointVersion
>({
  // @ts-expect-error -- you can't pass in an entrypoint for a union version. entrypoint in this case is never
  entryPoint: getEntryPoint(sepolia),
  transport: http(),
  chain: sepolia,
  signer: LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey()),
});

const lightAccount062: LightAccount<
  LocalAccountSigner<PrivateKeyAccount>,
  "0.6.0"
> = await createLightAccount({
  transport: http(),
  chain: sepolia,
  signer: LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey()),
});

const lightAccount07: LightAccount<
  LocalAccountSigner<PrivateKeyAccount>,
  "0.7.0"
> = await createLightAccount({
  entryPoint: getEntryPoint(sepolia, { version: "0.7.0" }),
  // @ts-expect-error -- version must be not equal to 1, but we dont' support that
  version: "v2.0.0",
  transport: http(),
  chain: sepolia,
  signer: LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey()),
});
