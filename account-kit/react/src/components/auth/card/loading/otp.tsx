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
import { AuthStepStatus, useAuthContext } from "../../context.js";
import { useAuthenticate } from "../../../../hooks/useAuthenticate.js";
import { useSignerStatus } from "../../../../hooks/useSignerStatus.js";

const AUTH_DELAY = 3000;

export const LoadingOtp = () => {
  const { isConnected } = useSignerStatus();
  const { setAuthStep, authStep } = useAuthContext("otp_verify");
  const [otpCode, setOtpCode] = useState<OTPCodeType>(initialOTPValue);
  const [errorText, setErrorText] = useState(authStep.error?.message || "");
  const [titleText, setTitleText] = useState(ls.loadingOtp.title);
  // const { setAuthStep } = useAuthContext();
  const resetOTP = (errorText = "") => {
    setOtpCode(initialOTPValue);
    setErrorText(errorText);
    setTitleText(ls.loadingOtp.title);
  };
  const { authenticate } = useAuthenticate({
    onError: (error: any) => {
      console.error(error);

      setAuthStep({ ...authStep, error, status: AuthStepStatus.base });
      resetOTP(getUserErrorMessage(error));
    },
    onSuccess: () => {
      if (isConnected) {
        setAuthStep({ ...authStep, status: AuthStepStatus.success });
        setTitleText(ls.loadingOtp.verified);

        // Wait 3 seconds before completing the auth step
        setTimeout(() => {
          setAuthStep({ type: "complete" });
        }, AUTH_DELAY);
      }
    },
  });

  const setValue = (otpCode: OTPCodeType) => {
    setOtpCode(otpCode);
    if (isOTPCodeType(otpCode)) {
      const otp = otpCode.join("");

      setAuthStep({ ...authStep, status: AuthStepStatus.verifying });
      setTitleText(ls.loadingOtp.verifying);
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
        {titleText}
      </h3>
      <p className="text-fg-secondary text-center text-sm mb-1">
        {ls.loadingOtp.body}
      </p>
      <p className="text-fg-primary text-center text-sm font-medium mb-5">
        {authStep.email}
      </p>
      <OTPInput
        disabled={authStep.status === AuthStepStatus.verifying}
        value={otpCode}
        setValue={setValue}
        setErrorText={setErrorText}
        errorText={errorText}
        handleReset={resetOTP}
        isVerified={authStep.status === AuthStepStatus.success}
      />
    </div>
  );
};

function getUserErrorMessage(error: Error | undefined): string {
  if (!error) {
    return "";
  }
  // Errors from Alchemy have a JSON message.
  try {
    const message = JSON.parse(error.message).error;
    if (message === "invalid OTP code") {
      return ls.error.otp.invalid;
    }
    return message;
  } catch (e) {
    // Ignore
  }
  return error.message;
}
