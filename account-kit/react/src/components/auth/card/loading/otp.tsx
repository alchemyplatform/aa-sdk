import { useState } from "react";
import { EmailIllustration } from "../../../../icons/illustrations/email.js";
import { ls } from "../../../../strings.js";
import {
  OTPInput,
  type OTPCodeType,
  initialOTPValue,
  isOTPCodeType,
} from "../../../otp-input/otp-input.js";
import { Spinner } from "../../../../icons/spinner.js";
import { useAuthContext } from "../../context.js";
import { useAuthenticate } from "../../../../hooks/useAuthenticate.js";
import { useSignerStatus } from "../../../../hooks/useSignerStatus.js";

export const LoadingOtp = () => {
  const { isConnected } = useSignerStatus();
  const { authStep } = useAuthContext("otp_verify");
  const [otpCode, setOtpCode] = useState<OTPCodeType>(initialOTPValue);
  const [errorText, setErrorText] = useState(authStep.error?.message || "");
  const [isDisabled, setIsDisabled] = useState(false);
  const { setAuthStep } = useAuthContext();
  const resetOTP = (errorText = "") => {
    setOtpCode(initialOTPValue);
    setErrorText(errorText);
    setIsDisabled(false);
  };

  const { authenticate } = useAuthenticate({
    onError: (error: any) => {
      console.error(error);
      const { email } = authStep;
      setAuthStep({ type: "otp_verify", email, error });
      resetOTP(error.message);
    },
    onSuccess: () => {
      if (isConnected) {
        setAuthStep({ type: "complete" });
      }
    },
  });

  const setValue = (otpCode: OTPCodeType) => {
    setOtpCode(otpCode);
    if (isOTPCodeType(otpCode)) {
      setIsDisabled(true);
      const otp = otpCode.join("");
      authenticate({ type: "otp", otpCode: otp });
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
        {ls.loadingOtp.title}
      </h3>
      <p className="text-fg-secondary text-center text-sm mb-1">
        {ls.loadingOtp.body}
      </p>
      <p className="text-fg-primary text-center text-sm font-medium mb-5">
        {authStep.email}
      </p>
      <OTPInput
        disabled={isDisabled}
        value={otpCode}
        setValue={setValue}
        setErrorText={setErrorText}
        errorText={errorText}
        handleReset={resetOTP}
      />
    </div>
  );
};
