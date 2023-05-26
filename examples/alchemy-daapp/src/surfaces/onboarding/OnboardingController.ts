import { useCallback, useEffect, useMemo, useState } from "react";
import { signMessage } from "@wagmi/core";
import { toHex, encodeFunctionData } from "viem";
import {
  createPublicErc4337Client,
  SimpleSmartContractAccount,
  type SimpleSmartAccountOwner,
  SmartAccountProvider,
  alchemyPaymasterAndDataMiddleware,
} from "@alchemy/aa-core";
import { useAccount, useNetwork } from "wagmi";
import { NFTContractABI } from "../../clients/nftContract";
import { daappConfigurations } from "../../configs/clientConfigs";
import {
  MIN_ONBOARDING_WALLET_BALANCE,
  OnboardingContext,
  OnboardingStep,
  OnboardingStepIdentifier,
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
    throw new Error("Timedout waiting for contrat deployment and NFT mint.");
  }
  return reciept;
}

export function useOnboardingController(useGasManager: boolean) {
  const { address: ownerAddress } = useAccount();
  const { chain } = useNetwork();
  const [currentStep, updateStep] = useState<OnboardingStep>({
    percent: 0,
    description: "Pulling together current information for account creation.",
    title: "Gathering Information",
    identifier: OnboardingStepIdentifier.INITIAL_STEP,
    params: {
      ownerAddress,
      chain,
    },
  });

  const { baseClient, appConfig } = useMemo(() => {
    if (!chain) {
      throw new Error("No chain to create client for. Please connect first.");
    }
    const appConfig = daappConfigurations[chain.id];
    if (!appConfig) {
      throw new Error(
        "Couldn't find a configuration for ap chain. Please connect to a valid chain first."
      );
    }
    const baseClient = createPublicErc4337Client({
      chain,
      rpcUrl: appConfig.rpcUrl,
    });
    return { baseClient, appConfig };
  }, [chain]);
  const [isLoading, setIsLoading] = useState(false);

  const reset = useCallback(() => {
    updateStep({
      percent: 0,
      description: "Pulling together current information for account creation.",
      title: "Gathering Information",
      identifier: OnboardingStepIdentifier.INITIAL_STEP,
      params: {
        ownerAddress,
        chain,
      },
    });
  }, [updateStep]);

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
          ...inMemStep.params,
          ...context,
        };
        const meta = await metaForStepIdentifier(
          stepIdentifier,
          context,
          chain!
        );
        const resolvedStep = {
          identifier: stepIdentifier,
          params: assembledContext,
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
        switch (inMemStep.identifier) {
          // This is the first step it checks for and creates the owener signer.
          case OnboardingStepIdentifier.INITIAL_STEP:
            if (!ownerAddress) {
              throw new Error("No connected account or address");
            }
            const owner: SimpleSmartAccountOwner = {
              signMessage: async (msg) =>
                signMessage({
                  message: toHex(msg),
                }),
              getAddress: async () => ownerAddress,
            };
            await _updateStep(OnboardingStepIdentifier.GET_ENTRYPOINT, {
              owner,
            });
            break;
          // This is the first step. It will fetch the entrypoint address for the account.
          case OnboardingStepIdentifier.GET_ENTRYPOINT:
            const entrypointAddress = await baseClient
              .getSupportedEntryPoints()
              .then((entrypoints) => {
                if (entrypoints.length === 0) {
                  throw new Error("No entrypoints found");
                }
                return entrypoints[0];
              });
            await _updateStep(OnboardingStepIdentifier.CREATE_SCWALLET, {
              entrypointAddress,
            });
            break;
          /*
           * This step will create the smart contract wallet for the account by
           * calling the factory contract. As well as setup the smart account signer, with
           * a paymaster middleware (if useGasManager is true).
           */
          case OnboardingStepIdentifier.CREATE_SCWALLET:
            if (!inMemStep.params.entrypointAddress) {
              throw new Error("No entrypoint address was found");
            }
            const entryPointAddress = inMemStep.params.entrypointAddress;
            const baseSigner = new SmartAccountProvider(
              appConfig.rpcUrl,
              inMemStep.params.entrypointAddress!,
              inMemStep.params.chain!
            ).connect((provider: any) => {
              if (!inMemStep.params.owner) {
                throw new Error("No owner for account was found");
              }
              return new SimpleSmartContractAccount({
                entryPointAddress,
                chain: inMemStep.params.chain!,
                owner: inMemStep.params.owner,
                factoryAddress: appConfig.simpleAccountFactoryAddress,
                rpcClient: provider,
              });
            });
            const smartAccountAddress = await baseSigner.getAddress();
            if (useGasManager) {
              const smartAccountSigner =
                await baseSigner.withPaymasterMiddleware(
                  alchemyPaymasterAndDataMiddleware({
                    provider: baseSigner.rpcClient,
                    policyId: appConfig.gasManagerPolicyId,
                    entryPoint: entryPointAddress,
                  })
                );
              await _updateStep(OnboardingStepIdentifier.MINT_NFT, {
                smartAccountAddress,
                smartAccountSigner,
              });
            } else {
              await _updateStep(OnboardingStepIdentifier.FILL_SCWALLET, {
                smartAccountAddress,
                smartAccountSigner: baseSigner,
              });
            }
            break;
          /*
           * This step prompts and waits for the user to send funds to the smart contract wallet.
           * It will poll the smart contract wallet for a balance greater than <MIN_ONBOARDING_WALLET_BALANCE> <SYMBOL>.
           */
          case OnboardingStepIdentifier.FILL_SCWALLET:
            await pollForLambdaForComplete(async () => {
              if (!inMemStep.params.smartAccountAddress) {
                throw new Error(
                  "An account address to add funds was not found"
                );
              }
              return baseClient
                .getBalance({ address: inMemStep.params.smartAccountAddress })
                .then((val) => {
                  return val >= MIN_ONBOARDING_WALLET_BALANCE;
                });
            }, 60 * 5); // wait up to 5 minutes
            await _updateStep(OnboardingStepIdentifier.MINT_NFT, {});
          /*
           * This step will call an operation for the smart contract to mint an NFT
           * NOTE: This also then triggers a deployment of the smart contract wallet.
           */
          case OnboardingStepIdentifier.MINT_NFT:
            const targetAddress =
              await inMemStep.params.smartAccountSigner?.getAddress();
            if (
              !inMemStep.params.smartAccountSigner?.account ||
              !targetAddress
            ) {
              throw new Error("No SCW account was found");
            }
            const { hash: mintDeployOpHash } =
              await inMemStep.params.smartAccountSigner.sendUserOperation(
                appConfig.nftContractAddress,
                encodeFunctionData({
                  abi: NFTContractABI.abi,
                  functionName: "mintTo",
                  args: [targetAddress],
                })
              );
            await _updateStep(OnboardingStepIdentifier.CHECK_OP_COMPLETE, {
              mintDeployOpHash: mintDeployOpHash as `0x${string}`,
            });
            break;
          /*
           * This step will poll the smart contract wallet for the deployment operation to complete.
           * Once it is complete it will store the smart contract wallet address in local storage.
           */
          case OnboardingStepIdentifier.CHECK_OP_COMPLETE:
            await pollForLambdaForComplete(async () => {
              if (!inMemStep.params.mintDeployOpHash) {
                throw new Error("No mint deploy operation Hash was found");
              }
              return baseClient
                .getUserOperationReceipt(inMemStep.params.mintDeployOpHash)
                .then((receipt) => {
                  return receipt !== null;
                });
            });
            await _updateStep(OnboardingStepIdentifier.STORE_SCWALLET, {});
            break;
          /*
           * This step will store the smart contract wallet address in local storage.
           * NOTE: In production this should be stored in a database, or on chain somewhere.
           */
          case OnboardingStepIdentifier.STORE_SCWALLET:
            const inMemOwnerAddress =
              await inMemStep.params.owner?.getAddress();
            if (!inMemOwnerAddress) {
              throw new Error("No owner for account was found");
            }
            if (!inMemStep.params.smartAccountAddress) {
              throw new Error("No SCW was found");
            }
            localStorage.setItem(
              inMemOwnerAddress,
              inMemStep.params.smartAccountAddress
            );
            await _updateStep(OnboardingStepIdentifier.DONE, {});
            break;
          default:
            throw new Error("Unknown step identifier");
        }
      }
    } catch (e) {
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [updateStep, currentStep, useGasManager, appConfig, baseClient]);

  return {
    currentStep,
    updateStep,
    isLoading,
    go,
    reset,
  };
}
