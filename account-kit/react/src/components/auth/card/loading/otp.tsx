import { useEffect, useState } from "react";
import { EmailIllustration } from "../../../../icons/illustrations/email.js";
import { ls } from "../../../../strings.js";
import {
  OTPInput,
  type OTPCodeType,
  initialOTPValue,
  isOTPCodeType,
} from "../../../otp-input/otp-input.jsx";
import { Spinner } from "../../../../icons/spinner.jsx";
import { useAuthContext } from "../../context.js";
import { useAuthenticate } from "../../../../hooks/useAuthenticate.js";
import { useSignerStatus } from "../../../../hooks/useSignerStatus.js";

export const LoadingOtp = () => {
  const { authStep } = useAuthContext("otp_verify");
  const [otpCode, setOtpCode] = useState<OTPCodeType>(initialOTPValue);
  const [errorText, setErrorText] = useState("");
  const { setAuthStep } = useAuthContext();

  const { authenticate } = useAuthenticate({
    onError: (error: any) => {
      console.error(error);
      // Assumption is that the error is an invalid OTP, should we have a specific error for incorrect OTP and one to throw error component?
      setErrorText(error.message);
    },
    onSuccess: () => {
      setAuthStep({ type: "complete" });
    },
  });

  const resetOTP = () => {
    setOtpCode(initialOTPValue);
    setErrorText("");
  };

  const handleReset = () => {
    resetOTP();
    // TODO: add resend logic to resend email
  };

  useEffect(() => {
    if (isOTPCodeType(otpCode)) {
      authenticate({ type: "otp", otpCode: otpCode.join("") });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpCode]);

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
      <p className="text-fg-primary text-center text-sm font-medium mb-5 ">
        {authStep.email}
      </p>
      <OTPInput
        value={otpCode}
        setValue={setOtpCode}
        setErrorText={setErrorText}
        errorText={errorText}
        handleReset={resetOTP}
        className="mb-7"
      />
      <p className="text-fg-tertiary text-center text-sm mb-5">
        {ls.loadingOtp.notReceived}
        <button
          className="ml-1 text-btn-primary underline"
          onClick={handleReset}
        >
          {ls.loadingOtp.resend}
        </button>
      </p>
    </div>
  );
};

export const CompletingOtp = () => {
  const { isConnected } = useSignerStatus();
  const { setAuthStep, authStep } = useAuthContext("otp_completing");

  useEffect(() => {
    if (isConnected && authStep.createPasskeyAfter) {
      setAuthStep({ type: "passkey_create" });
    } else if (isConnected) {
      setAuthStep({ type: "complete" });
    }
  }, [authStep.createPasskeyAfter, isConnected, setAuthStep]);

  if (authStep.error) {
    const { email } = authStep;
    setAuthStep({ type: "otp_verify", email, error: authStep.error });
  }

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
