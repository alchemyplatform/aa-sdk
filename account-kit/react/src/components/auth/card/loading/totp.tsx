import { useState } from "react";
import { useAuthContext } from "../../context.js";
import { useAuthenticate } from "../../../../hooks/useAuthenticate.js";
import {
  OTPInput,
  initialOTPValue,
  isOTPCodeType,
  type OTPCodeType,
} from "../../../otp-input/otp-input.js";
import { Spinner } from "../../../../icons/spinner.js";
import { ThreeStarsIcon } from "../../../../icons/threeStars.js";

export const LoadingTotp = () => {
  const { authStep, setAuthStep } = useAuthContext("totp_verify");
  const [totpCode, setTotpCode] = useState<OTPCodeType>(initialOTPValue);
  const [errorText, setErrorText] = useState(authStep.error?.message || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { authenticateAsync } = useAuthenticate({
    onMutate: async (params) => {
      if (params.type === "email" && "email" in params) {
        if (params.emailMode === "magicLink") {
          setAuthStep({ type: "email_verify", email: params.email });
        }
      }
    },
    onSuccess: () => {
      setIsSubmitting(false);
      setAuthStep({ type: "complete" });
    },
    onError: (err) => {
      console.error("TOTP verify error", err);
      setIsSubmitting(false);
      setErrorText("The code you entered is incorrect");
      setTotpCode(initialOTPValue);
    },
  });

  const setValue = async (otpCode: OTPCodeType) => {
    setTotpCode(otpCode);
    if (isOTPCodeType(otpCode)) {
      setIsSubmitting(true);
      const otp = otpCode.join("");
      handleVerify(otp);
    }
  };

  // Called when all digits are typed or user hits "Verify" button
  const handleVerify = async (codeString: string) => {
    try {
      if (authStep.previousStep === "magicLink") {
        await authenticateAsync({
          type: "email",
          email: authStep.email,
          emailMode: "magicLink",
          redirectParams: new URLSearchParams(),
          multiFactors: [
            {
              multiFactorId: authStep.factorId,
              multiFactorCode: codeString,
            },
          ],
        });
      } else if (authStep.previousStep === "otp") {
        await authenticateAsync({
          type: "otp",
          otpCode: authStep.otpCode ?? "",
          multiFactors: [
            {
              multiFactorId: authStep.factorId,
              multiFactorCode: codeString,
            },
          ],
        });
      } else {
        throw new Error("Invalid previous step");
      }
    } catch (err) {
      console.error("TOTP submission error", err);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-12 w-12 mb-5">
        <Spinner className="absolute" />
        <ThreeStarsIcon className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
      <h3 className="text-fg-primary font-semibold text-lg mb-2">
        Enter authentication code
      </h3>
      <OTPInput
        value={totpCode}
        setValue={setValue}
        errorText={errorText}
        setErrorText={setErrorText}
        disabled={isSubmitting}
        handleReset={() => setTotpCode(initialOTPValue)}
      />
    </div>
  );
};
