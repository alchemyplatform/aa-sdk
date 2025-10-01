import { useState, useEffect } from "react";
import { useSignerStatus } from "../../../../hooks/useSignerStatus.js";
import { AlchemySignerStatus } from "@account-kit/signer";
import { useAuthContext } from "../../context.js";
import { useSigner } from "../../../../hooks/useSigner.js";
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
  const signer = useSigner();
  const { status } = useSignerStatus();
  const { authStep, setAuthStep } = useAuthContext("totp_verify");
  const [totpCode, setTotpCode] = useState<OTPCodeType>(initialOTPValue);
  const [errorText, setErrorText] = useState(authStep.error?.message || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { authenticateAsync } = useAuthenticate({
    onSuccess: () => {
      setIsSubmitting(false);
      setAuthStep({ type: "complete" });
    },
    onError: (err) => {
      setIsSubmitting(false);
      setTotpCode(initialOTPValue);

      if ((err as Error).message.includes("Invalid MFA code")) {
        setErrorText("The code you entered is incorrect");
      } else {
        setErrorText("An error occurred while verifying the code");
        console.error("TOTP verify error", err);
      }
    },
  });

  useEffect(() => {
    if (
      authStep.previousStep === "magicLink" &&
      status === AlchemySignerStatus.AWAITING_EMAIL_AUTH
    ) {
      setAuthStep({ type: "email_verify", email: authStep.email });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

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
        await signer?.validateMultiFactors({
          multiFactorCode: codeString,
        });
        setIsSubmitting(false);
        setAuthStep({ type: "complete" });
      } else {
        throw new Error("Invalid previous step");
      }
    } catch (err) {
      if ((err as Error).message.includes("Invalid MFA code")) {
        setIsSubmitting(false);
        setTotpCode(initialOTPValue);
        setErrorText("The code you entered is incorrect");
      } else {
        console.error("TOTP submission error", err);
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-12 w-12 mb-5">
        <Spinner className="absolute" />
        <ThreeStarsIcon className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
      <h3 className="text-fg-primary font-semibold text-lg mb-2">
        Enter authenticator app code
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
