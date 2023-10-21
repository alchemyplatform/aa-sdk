import {
  LightAccountFactoryAbi,
  LightSmartContractAccount,
} from "@alchemy/aa-accounts";
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import { EntryPointAbi, type SmartAccountSigner } from "@alchemy/aa-core";
import { useCallback, useState } from "react";
import {
  alchemyRpcUrl,
  chain,
  gasManagerPolicyId,
  lightAccountFactoryAddress,
} from "shared/config/env";
import {
  concatHex,
  encodeFunctionData,
  getContract,
  type Address,
  type Hex,
  type PublicClient,
} from "viem";

type AlchemyProviderProps = {
  entryPointAddress: Address;
};

export const useAlchemyProvider = ({
  entryPointAddress,
}: AlchemyProviderProps) => {
  const [provider, setProvider] = useState<AlchemyProvider>(
    new AlchemyProvider({
      chain,
      entryPointAddress,
      rpcUrl: alchemyRpcUrl,
    }),
  );

  const getAddressFromAccount = async (signer: SmartAccountSigner) => {
    try {
      const account = new LightSmartContractAccount({
        rpcClient: provider.rpcClient,
        owner: signer,
        chain,
        entryPointAddress,
        factoryAddress: lightAccountFactoryAddress,
      });
      const address = await account.getAddress();
      return address;
    } catch (err: any) {
      console.error("[getAddressFromAccount]", err);
    }
    return null;
  };

  const getEntryPointContract = () => {
    try {
      return getContract({
        address: entryPointAddress,
        abi: EntryPointAbi,
        publicClient: provider.rpcClient as PublicClient,
      });
    } catch (err: any) {
      console.error("[getEntryPointContract]", err);
      return null;
    }
  };

  const getAccountInitCode = async (
    signer: SmartAccountSigner,
  ): Promise<Hex | null> => {
    try {
      return concatHex([
        lightAccountFactoryAddress,
        encodeFunctionData({
          abi: LightAccountFactoryAbi,
          functionName: "createAccount",
          args: [await signer.getAddress(), 0n],
        }),
      ]);
    } catch (err: any) {
      console.error("[getAccountInitCode]", err);
      return null;
    }
  };

  const getAddress = async (
    signer: SmartAccountSigner,
  ): Promise<Address | null> => {
    const initCode = await getAccountInitCode(signer);
    if (!initCode) return null;

    const entryPoint = await getEntryPointContract();
    if (!entryPoint) return null;

    try {
      await entryPoint.simulate.getSenderAddress([initCode]);
    } catch (err: any) {
      console.log(
        "[BaseSmartContractAccount](getAddress) entrypoint.getSenderAddress result: ",
        err,
      );
      if (err.cause?.data?.errorName === "SenderAddressResult") {
        const accountAddress = err.cause.data.args[0] as Address;
        console.log(
          "[getAddress] entrypoint.getSenderAddress result: ",
          accountAddress,
        );
        return accountAddress;
      }
    }

    console.log("getCounterFactualAddress failed");
    return null;
  };

  const connectProviderToAccount = useCallback(
    (signer: SmartAccountSigner, account?: Address) => {
      const connectedProvider = provider
        .connect((rpcClient) => {
          console.log("1111111");
          const acc = new LightSmartContractAccount({
            rpcClient,
            owner: signer,
            chain,
            entryPointAddress,
            factoryAddress: lightAccountFactoryAddress,
            accountAddress: account,
          });
          console.log("2222222");
          acc.getAddress().then((address) => {
            console.log("3333333", address);
          });
          console.log("4444444");
          return acc;
        })
        .withAlchemyGasManager({
          policyId: gasManagerPolicyId,
          entryPoint: entryPointAddress,
        });

      setProvider(connectedProvider);

      console.log(
        "[useAlchemyProvider] Alchemy Provider connected to account %s \
        (Signer type %s, Gas Manager Policy ID %s, Entry Point Address %s, Factory Address %s)",
        connectedProvider.account,
        signer.signerType,
        gasManagerPolicyId,
        entryPointAddress,
        lightAccountFactoryAddress,
      );

      return connectedProvider;
    },
    [entryPointAddress, provider],
  );

  const disconnectProviderFromAccount = useCallback(() => {
    const disconnectedProvider = provider.disconnect();

    setProvider(disconnectedProvider);
    return disconnectedProvider;
  }, [provider]);

  return {
    provider,
    getAddressFromAccount,
    getEntryPointContract,
    getAccountInitCode,
    getAddress,
    connectProviderToAccount,
    disconnectProviderFromAccount,
  };
};
