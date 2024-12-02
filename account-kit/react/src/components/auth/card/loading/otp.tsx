import { useCallback, useEffect, useState } from "react";
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

export const LoadingOtp = () => {
  const { authStep } = useAuthContext("otp_verify");
  const [otpCode, setOtpCode] = useState<OTPCodeType>(initialOTPValue);
  const [errorText, setErrorText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const resetOTP = () => {
    setOtpCode(initialOTPValue);
    setErrorText("");
  };
  const handleSubmit = useCallback(() => {
    setIsLoading(true);
    // TODO: add submit logic
    console.log("submit", otpCode);
  }, [otpCode]);
  const handleReset = () => {
    resetOTP();
    setIsLoading(false);
    // TODO: add resend logic
  };
  useEffect(() => {
    if (isOTPCodeType(otpCode)) {
      console.log("submitting");
      handleSubmit();
    }
  }, [handleSubmit, otpCode]);

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
        disabled={isLoading}
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
  return <div>CompletingOTP</div>;
};
