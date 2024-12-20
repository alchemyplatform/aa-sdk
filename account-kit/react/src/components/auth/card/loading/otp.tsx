import { useEffect, useState } from "react";
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
  const { authStep, setAuthStep } = useAuthContext("otp_verify");
  const [otpCode, setOtpCode] = useState<OTPCodeType>(initialOTPValue);
  const [errorText, setErrorText] = useState(
    getUserErrorMessage(authStep.error)
  );
  const resetOTP = () => {
    setOtpCode(initialOTPValue);
    setErrorText("");
  };
  const { authenticate } = useAuthenticate({
    onError: (error: any) => {
      console.error(error);
      const { email } = authStep;
      setAuthStep({ type: "otp_verify", email, error });
    },
    onSuccess: () => {
      if (isConnected) {
        setAuthStep({ type: "complete" });
      }
    },
  });

  useEffect(() => {
    if (isOTPCodeType(otpCode)) {
      setAuthStep({
        type: "otp_completing",
        email: authStep.email,
        otp: otpCode.join(""),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpCode]);

  const setValue = (otpCode: OTPCodeType) => {
    setOtpCode(otpCode);
    if (isOTPCodeType(otpCode)) {
      const otp = otpCode.join("");
      setAuthStep({
        type: "otp_completing",
        email: authStep.email,
        otp,
      });
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
        value={otpCode}
        setValue={setValue}
        setErrorText={setErrorText}
        errorText={errorText}
        handleReset={resetOTP}
      />
    </div>
  );
};

export const CompletingOtp = () => {
  return (
    <div className="flex flex-col items-center justify-center ">
      <div className="flex flex-col items-center justify-center h-12 w-12 mb-5">
        <Spinner />
      </div>
      <h2 className="text-fg-primary font-semibold text-lg mb-2">
        {ls.completingOtp.title}
      </h2>
      <p className="text-fg-secondary text-center text-sm">
        {ls.completingOtp.body}
      </p>
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
