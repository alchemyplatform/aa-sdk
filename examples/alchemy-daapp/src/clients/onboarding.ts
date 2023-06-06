import { useCallback, useState } from "react";

export interface OnboardingContext {
  accountAddress?: string;
}

export interface OnboardingStep {
  percent: number;
  description: string;
  title: string;
  identifier: OnboardingStepIdentifier;
  params: OnboardingContext;
}

enum OnboardingStepIdentifier {
  INITIAL_STEP = "initial-step",
  DONE = "done",
}

export function useOnboardingController() {
  const [currentStep, updateStep] = useState<OnboardingStep>({
    percent: 0,
    description: "Pulling together current information for account creation.",
    title: "Gathering Information",
    identifier: OnboardingStepIdentifier.INITIAL_STEP,
    params: {},
  });

  const [isLoading, setIsLoading] = useState(false);

  const go = useCallback(async () => {
    try {
      let inMemStep = currentStep;
      function _updateStep(step: OnboardingStep) {
        inMemStep = step;
        updateStep(step);
      }
      if (inMemStep.identifier === OnboardingStepIdentifier.INITIAL_STEP) {
        _updateStep({
          percent: 100,
          description: "We need to impliment onboarding still! 👀",
          title: "Done 🔥",
          params: {},
          identifier: OnboardingStepIdentifier.DONE,
        });
      }
      throw new Error("Unknown step identifier");
    } catch (e) {
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [updateStep, currentStep]);

  const reset = useCallback(() => {
    updateStep({
      percent: 0,
      description: "Pulling together current information for account creation.",
      title: "Gathering Information",
      identifier: OnboardingStepIdentifier.INITIAL_STEP,
      params: {},
    });
  }, [updateStep]);

  return {
    currentStep,
    updateStep,
    isLoading,
    go,
    reset,
  };
}
