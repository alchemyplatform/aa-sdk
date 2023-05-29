import {
  PublicErc4337Client,
  SimpleSmartAccountOwner,
  SmartAccountProvider,
} from "@alchemy/aa-core";
import { Chain } from "viem";
import { RequestFunds } from "./RequestFunds";
import { use } from "react";

// .01 in wei
export const MIN_ONBOARDING_WALLET_BALANCE = BigInt("10000000000000000");

export interface OnboardingContext {
  useGasManager: boolean;
  client: PublicErc4337Client;
  ownerAddress: `0x${string}`;
  owner: SimpleSmartAccountOwner;
  smartAccountAddress: `0x${string}`;
  smartAccountSigner: SmartAccountProvider;
  chain: Chain;
  entrypointAddress: `0x${string}`;
  mintDeployOpHash: `0x${string}`;
}

export interface OnboardingStep {
  percent: number;
  description: string | JSX.Element;
  title: string;
  identifier: OnboardingStepIdentifier;
  context: Partial<OnboardingContext>;
}

export enum OnboardingStepIdentifier {
  INITIAL_STEP,
  GET_ENTRYPOINT,
  CREATE_SCWALLET,
  FILL_SCWALLET,
  MINT_NFT,
  CHECK_OP_COMPLETE,
  STORE_SCWALLET,
  DONE,
}

export function initialStep(
  ownerAddress: `0x${string}`,
  client: PublicErc4337Client,
  chain: Chain,
  useGasManager: boolean
): OnboardingStep {
  const meta = metaForStepIdentifier(
    OnboardingStepIdentifier.INITIAL_STEP,
    {},
    chain
  );
  return {
    ...meta,
    identifier: OnboardingStepIdentifier.INITIAL_STEP,
    context: {
      ownerAddress,
      client,
      chain,
      useGasManager,
    },
  };
}

export function metaForStepIdentifier(
  step: OnboardingStepIdentifier,
  context: Partial<OnboardingContext>,
  chain: Chain
) {
  switch (step) {
    case OnboardingStepIdentifier.INITIAL_STEP:
      return {
        percent: 0,
        description:
          "Pulling together current information for account creation.",
        title: "Gathering Information",
      };
    case OnboardingStepIdentifier.GET_ENTRYPOINT:
      return {
        percent: 10,
        description: "Fetching the entrypoint address for the account.",
        title: "Fetching Entrypoint",
      };
    case OnboardingStepIdentifier.CREATE_SCWALLET:
      return {
        percent: 20,
        description: "Creating the smart contract wallet for the account.",
        title: "Creating Smart Contract Wallet",
      };
    case OnboardingStepIdentifier.FILL_SCWALLET:
      return {
        percent: 35,
        description: (
          <RequestFunds chain={chain} address={context.smartAccountAddress!} />
        ),
        title: "Add Funds to Smart Contract Wallet",
      };
    case OnboardingStepIdentifier.MINT_NFT:
      return {
        percent: 50,
        description:
          "Submitting a transaction to deploy your account and mint the NFT for your account.",
        title: "Deploy & Mint NFT",
      };
    case OnboardingStepIdentifier.CHECK_OP_COMPLETE:
      return {
        percent: 60,
        description: "Waiting for deploy and mint operation to be completed.",
        title: `Waiting for operation ${context.mintDeployOpHash} to complete.`,
      };
    case OnboardingStepIdentifier.STORE_SCWALLET:
      return {
        percent: 80,
        description: `Storing SCW: ${context.smartAccountAddress} in local storage.`,
        title: "Storing Smart Contract Wallet",
      };
    case OnboardingStepIdentifier.DONE:
      return {
        percent: 100,
        description: "Completed onboarding! 👀",
        title: "Done 🔥",
      };
  }
}
