import { LightSmartContractAccount, getDefaultLightAccountFactory } from "@alchemy/aa-accounts";
import { AlchemyProvider, withAlchemyGasManager } from "@alchemy/aa-alchemy";
import {
  createPublicErc4337Client,
  type SmartAccountSigner
} from "@alchemy/aa-core";
import { useCallback, useEffect, useMemo, useState } from "react";
import { encodeFunctionData } from "viem";
import { useAccount, useNetwork, type Chain } from "wagmi";
import { localSmartContractStore } from "~/clients/localStorage";
import { NFTContractABI } from "../../clients/nftContract";
import {
  DAAppConfiguration,
  daappConfigurations,
} from "../../configs/clientConfigs";
import {
  MIN_ONBOARDING_WALLET_BALANCE,
  OnboardingContext,
  OnboardingStep,
  OnboardingStepIdentifier,
  initialStep,
  metaForStepIdentifier,
} from "./OnboardingDataModels";

async function pollForLambdaForComplete(
  lambda: () => Promise<boolean>,
  txnMaxDurationSeconds: number = 20
) {
  let txnRetryCount = 0;
  let reciept;
  do {
    reciept = await lambda();
    if (!reciept) {
      // wait 1 second before trying again
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } while (!reciept && txnRetryCount++ < txnMaxDurationSeconds);
  if (!reciept) {
    throw new Error("Timedout waiting for processs completion.");
  }
  return reciept;
}

type OnboardingFunction = (
  context: Partial<OnboardingContext>,
  appConfig: DAAppConfiguration
) => Promise<{
  nextStep: OnboardingStepIdentifier;
  addedContext: Partial<OnboardingContext>;
}>;

const onboardingStepHandlers: Record<
  OnboardingStepIdentifier,
  OnboardingFunction
> = {
  // This is the first step it checks for the owner signer.
  [OnboardingStepIdentifier.INITIAL_STEP]: async (context) => {
    if (!context.ownerAddress) {
      throw new Error("No connected account or address");
    }
    if (!context.owner) {
      throw new Error("No connected account or address");
    }
    return {
      nextStep: OnboardingStepIdentifier.GET_ENTRYPOINT,
      addedContext: {},
    };
  },
  // This step gets the entrypoint for the smart account.
  [OnboardingStepIdentifier.GET_ENTRYPOINT]: async (context) => {
    if (!context.owner) {
      throw new Error("No owner");
    }
    const entrypointAddress = await context
      .client!.getSupportedEntryPoints()
      .then((entrypoints) => {
        if (entrypoints.length === 0) {
          throw new Error("No entrypoints found");
        }
        return entrypoints[0];
      });
    return {
      nextStep: OnboardingStepIdentifier.CREATE_SCWALLET,
      addedContext: {
        entrypointAddress,
      },
    };
  },
  /*
   * This step will create the smart contract wallet for the account by
   * calling the factory contract. As well as setup the smart account signer, with
   * a paymaster middleware (if useGasManager is true).
   */
  [OnboardingStepIdentifier.CREATE_SCWALLET]: async (context, appConfig) => {
    if (!context.entrypointAddress) {
      throw new Error("No entrypoint address was found");
    }

    const chain: Chain = context.chain!;
    const entryPointAddress = context.entrypointAddress;
    const baseProvider = new AlchemyProvider({
      rpcUrl: appConfig.rpcUrl,
      chain,
      entryPointAddress,
    }).connect(
      (rpcClient) => {
        if (!context.owner) {
          throw new Error("No owner for account was found");
        }
        return new LightSmartContractAccount({
          entryPointAddress: entryPointAddress,
          chain: rpcClient.chain,
          owner: context.owner,
          factoryAddress: getDefaultLightAccountFactory(rpcClient.chain),
          rpcClient,
        })
      });
    
    if (context.useGasManager) {
      const gasExtendedProvider = withAlchemyGasManager(baseProvider, {
        policyId: appConfig.gasManagerPolicyId,
        entryPoint: entryPointAddress,
      });
      const smartAccountAddress = await baseProvider.getAddress();

      return {
        nextStep: OnboardingStepIdentifier.MINT_NFT,
        addedContext: {
          smartAccountAddress,
          smartAccountSigner: gasExtendedProvider,
        },
      };
    } else {
      const smartAccountAddress = await baseProvider.getAddress();
      return {
        nextStep: OnboardingStepIdentifier.FILL_SCWALLET,
        addedContext: {
          smartAccountAddress,
          smartAccountSigner: baseProvider,
        },
      };
    }
  },
  /*
   * This step prompts and waits for the user to send funds to the smart contract wallet.
   * It will poll the smart contract wallet for a balance greater than <MIN_ONBOARDING_WALLET_BALANCE> <SYMBOL>.
   */
  [OnboardingStepIdentifier.FILL_SCWALLET]: async (context) => {
    await pollForLambdaForComplete(async () => {
      if (!context.smartAccountAddress) {
        throw new Error("An account address to add funds was not found");
      }
      return context
        .client!.getBalance({ address: context.smartAccountAddress })
        .then((val) => {
          return val >= MIN_ONBOARDING_WALLET_BALANCE;
        });
    }, 60 * 5); // wait up to 5 minutes
    return {
      nextStep: OnboardingStepIdentifier.MINT_NFT,
      addedContext: {},
    };
  },
  /*
   * This step will call an operation for the smart contract to mint an NFT
   * NOTE: This also then triggers a deployment of the smart contract wallet.
   */
  [OnboardingStepIdentifier.MINT_NFT]: async (context, appConfig) => {
    const targetAddress = await context.smartAccountSigner?.getAddress();
    if (!context.smartAccountSigner?.account || !targetAddress) {
      throw new Error("No SCW account was found");
    }
    const mintDeployTxnHash = await context.smartAccountSigner.sendTransaction({
      from: await context.smartAccountSigner.account.getAddress(),
      to: appConfig.nftContractAddress,
      data: encodeFunctionData({
        abi: NFTContractABI.abi,
        functionName: "mintTo",
        args: [targetAddress],
      }),
    });

    return {
      nextStep: OnboardingStepIdentifier.CHECK_OP_COMPLETE,
      addedContext: {
        mintDeployTxnHash: mintDeployTxnHash as `0x${string}`,
      },
    };
  },
  /*
   * This step will poll the smart contract wallet for the deployment operation to complete.
   * Once it is complete it will store the smart contract wallet address in local storage.
   */
  [OnboardingStepIdentifier.CHECK_OP_COMPLETE]: async (context) => {
    await pollForLambdaForComplete(async () => {
      if (!context.mintDeployTxnHash) {
        throw new Error("No mint deploy operation Hash was found");
      }
      return context
        .client!.getTransactionReceipt({ hash: context.mintDeployTxnHash })
        .then((receipt) => {
          return receipt !== null;
        });
    });
    return {
      nextStep: OnboardingStepIdentifier.STORE_SCWALLET,
      addedContext: {},
    };
  },
  /*
   * This step will store the smart contract wallet address in local storage.
   * NOTE: In production this should be stored in a database, or on chain somewhere.
   */
  [OnboardingStepIdentifier.STORE_SCWALLET]: async (context) => {
    const inMemOwnerAddress = await context.owner?.getAddress();
    if (!inMemOwnerAddress) {
      throw new Error("No owner for account was found");
    }
    if (!context.smartAccountAddress) {
      throw new Error("No SCW was found");
    }
    localSmartContractStore.addSmartContractAccount(
      inMemOwnerAddress,
      context.smartAccountAddress,
      context.chain?.id!
    );
    return {
      nextStep: OnboardingStepIdentifier.DONE,
      addedContext: {},
    };
  },
  /* DONE! --- No Op */
  [OnboardingStepIdentifier.DONE]: async (context) => {
    return {
      nextStep: OnboardingStepIdentifier.DONE,
      addedContext: {},
    };
  },
};

export function useOnboardingOrchestrator(
  useGasManager: boolean,
  owner: SmartAccountSigner
) {
  // Setup initial data and state
  const { address: ownerAddress } = useAccount();
  const { chain } = useNetwork();
  const { client, appConfig } = useMemo(() => {
    if (!chain) {
      throw new Error("No chain to create client for. Please connect first.");
    }
    const appConfig = daappConfigurations[chain.id];
    if (!appConfig) {
      throw new Error(
        `Couldn't find a configuration for chain ${chain.id}. Please connect to a valid chain first.`
      );
    }
    const client = createPublicErc4337Client({
      chain,
      rpcUrl: appConfig.rpcUrl,
    });
    return { client, appConfig };
  }, [chain]);
  const [currentStep, updateStep] = useState<OnboardingStep>(
    initialStep(owner!, ownerAddress!, client, chain!, useGasManager)
  );
  const [isLoading, setIsLoading] = useState(false);

  const reset = useCallback(
    () =>
      updateStep(
        initialStep(owner!, ownerAddress!, client, chain!, useGasManager)
      ),
    [ownerAddress, client, chain, useGasManager]
  );

  // Reset onboarding if key account and onboarding attributes change
  useEffect(() => {
    reset();
  }, [ownerAddress, chain, useGasManager]);

  const go = useCallback(async () => {
    try {
      let inMemStep = currentStep;
      async function _updateStep(
        stepIdentifier: OnboardingStepIdentifier,
        context: Partial<OnboardingContext>
      ) {
        const assembledContext = {
          ...inMemStep.context,
          ...context,
        };
        const meta = await metaForStepIdentifier(
          stepIdentifier,
          context,
          chain!
        );
        const resolvedStep = {
          identifier: stepIdentifier,
          context: assembledContext,
          ...meta,
        };
        inMemStep = resolvedStep;
        updateStep(resolvedStep);
      }

      /*
       * This is the main onboarding loop. It will continue until the
       * identifier is set to DONE. Each step will update the inMemStep
       * variable, which will be used to update the currentStep state variable.
       *
       * If a step is fails, it will throw an error, which will be caught by the
       * try/catch block and the onboarding can be continued from the last successful
       * step.
       */
      while (inMemStep.identifier !== OnboardingStepIdentifier.DONE) {
        await onboardingStepHandlers[inMemStep.identifier](
          inMemStep.context,
          appConfig
        )
          .then((step) => _updateStep(step.nextStep, step.addedContext))
          .catch((e) => {
            console.error(e);
            throw e;
          });
      }
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [currentStep, chain, updateStep, reset]);

  return {
    currentStep,
    updateStep,
    isLoading,
    go,
    reset,
  };
}
