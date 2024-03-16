import type { EntryPointParameter } from "@alchemy/aa-core";
import {
  FailedToGetStorageSlotError,
  InvalidEntryPointError,
  createBundlerClient,
  getAccountAddress,
  getEntryPoint,
  toSmartContractAccount,
  type Address,
  type EntryPointDef,
  type EntryPointDefRegistry,
  type EntryPointVersion,
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
  trim,
  type Hex,
  type SignTypedDataParameters,
  type Transport,
} from "viem";
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
  TEntryPointVersion extends EntryPointVersion,
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = SmartContractAccountWithSigner<
  TEntryPointVersion,
  "LightAccount",
  TSigner
> & {
  getLightAccountVersion: () => Promise<LightAccountVersion>;
  encodeTransferOwnership: (newOwner: Address) => Hex;
  getOwnerAddress: () => Promise<Address>;
};

export type CreateLightAccountParams<
  TEntryPointVersion extends EntryPointVersion,
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = Pick<
  ToSmartContractAccountParams<TEntryPointVersion, "LightAccount", TTransport>,
  "transport" | "chain"
> & {
  signer: TSigner;
  salt?: bigint;
  accountAddress?: Address;
  factoryAddress?: Address;
  initCode?: Hex;
  version?: LightAccountVersion;
} & EntryPointParameter<TEntryPointVersion>;

export async function createLightAccount<
  TEntryPointDef extends EntryPointDefRegistry[EntryPointVersion],
  TEntryPointVersion extends EntryPointVersion = TEntryPointDef extends EntryPointDef<
    infer U
  >
    ? U
    : never,
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  config: CreateLightAccountParams<TEntryPointVersion, TTransport, TSigner>
): Promise<LightAccount<TEntryPointVersion, TSigner>>;

export async function createLightAccount<
  TEntryPointDef extends EntryPointDefRegistry[EntryPointVersion],
  TEntryPointVersion extends EntryPointVersion = TEntryPointDef extends EntryPointDef<
    infer U
  >
    ? U
    : never,
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner
>({
  transport,
  chain,
  signer,
  initCode,
  version = "v1.1.0",
  entryPoint,
  accountAddress,
  factoryAddress = getDefaultLightAccountFactoryAddress(chain, version),
  salt: salt_ = 0n,
}: CreateLightAccountParams<TEntryPointVersion, TTransport, TSigner>): Promise<
  LightAccount<TEntryPointVersion>
> {
  const _entryPoint: EntryPointDef<EntryPointVersion> =
    entryPoint ?? getEntryPoint(chain);

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
    entryPoint: _entryPoint,
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

  const account =
    _entryPoint.version === "0.6.0"
      ? await toSmartContractAccount({
          transport,
          chain,
          entryPoint: _entryPoint as EntryPointDef<"0.6.0">,
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
        })
      : _entryPoint.version === "0.7.0"
      ? await toSmartContractAccount({
          transport,
          chain,
          entryPoint: _entryPoint as EntryPointDef<"0.7.0">,
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
        })
      : undefined;

  if (!account) throw new InvalidEntryPointError(chain, _entryPoint.version);

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
  } as LightAccount<TEntryPointVersion, TSigner>;
}
