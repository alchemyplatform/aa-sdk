import { useState } from "react";
import { useAuthContext } from "../../context.js";
import { useAuthenticate } from "../../../../hooks/useAuthenticate.js";
import {
  OTPInput,
  initialOTPValue,
  isOTPCodeType,
  type OTPCodeType,
} from "../../../otp-input/otp-input.js";
import { EmailIllustration } from "../../../../icons/illustrations/email.js";
import { Spinner } from "../../../../icons/spinner.js";

export const LoadingTotp = () => {
  const { authStep, setAuthStep } = useAuthContext("totp_verify");
  const [totpCode, setTotpCode] = useState<OTPCodeType>(initialOTPValue);
  const [errorText, setErrorText] = useState(authStep.error?.message || "");

  const { authenticate, isPending } = useAuthenticate({
    onSuccess: () => {
      setAuthStep({ type: "complete" });
    },
    onError: (err) => {
      console.error("TOTP verify error", err);
      setErrorText(err?.message || "TOTP invalid");
    },
  });

  const setValue = async (otpCode: OTPCodeType) => {
    setTotpCode(otpCode);
    if (isOTPCodeType(otpCode)) {
      const otp = otpCode.join("");
      handleVerify(otp);
    }
  };

  // Called when all digits are typed or user hits "Verify" button
  const handleVerify = async (codeString: string) => {
    try {
      await authenticate({
        type: "otp",
        otpCode: authStep.otpCode ?? "",
        multiFactor: {
          multiFactorId: authStep.factorId,
          multiFactorChallenge: { code: codeString },
        },
      });
    } catch (err) {
      console.error("TOTP submission error", err);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-12 w-12 mb-5">
        <Spinner className="absolute" />
        <EmailIllustration
          height="32"
          width="32"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        />
      </div>
      <h3 className="text-fg-primary font-semibold text-lg mb-2">
        Enter your TOTP Code
      </h3>
      <p className="text-fg-secondary text-center text-sm mb-5">
        Check your authenticator app for a 6-digit code.
      </p>
      <OTPInput
        value={totpCode}
        setValue={setValue}
        errorText={errorText}
        setErrorText={setErrorText}
        disabled={isPending}
        handleReset={() => setTotpCode(initialOTPValue)}
      />
    </div>
  );
};
