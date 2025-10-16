import { memo, useCallback, useEffect, useState } from "react";
import { useSubmitOtpCode } from "../../../hooks/useSubmitOtpCode.js";
import { useSendEmailOtp } from "../../../hooks/useSendEmailOtp.js";
import { ls } from "../../../strings.js";
import { Button } from "../../button.js";
import { useAuthContext } from "../context.js";
import {
  OTPInput,
  initialOTPValue,
  isOTPCodeType,
  type OTPCodeType,
} from "../../otp-input/otp-input.js";
import { Spinner } from "../../../icons/spinner.js";
import { AuthStepStatus } from "../context.js";

export const OtpAuth = memo(() => {
  const { authStep, setAuthStep } = useAuthContext("otp_verify");
  const [otpValue, setOtpValue] = useState<OTPCodeType>(initialOTPValue);
  const [errorText, setErrorText] = useState("");

  const { submitOtpCode, isPending: isSubmitting } = useSubmitOtpCode({
    mutation: {
      onSuccess: () => {
        setAuthStep({ type: "complete" });
      },
      onError: (error) => {
        console.error(error);
        setErrorText(ls.error.otp.invalid);
        setAuthStep({
          ...authStep,
          status: AuthStepStatus.error,
          error,
        });
      },
    },
  });

  const { sendEmailOtp, isPending: isResending } = useSendEmailOtp();

  const handleReset = useCallback(() => {
    setOtpValue(initialOTPValue);
    setErrorText("");
  }, []);

  const handleResend = useCallback(() => {
    sendEmailOtp({ email: authStep.email });
    handleReset();
  }, [authStep.email, sendEmailOtp, handleReset]);

  useEffect(() => {
    if (isOTPCodeType(otpValue)) {
      const otpCode = otpValue.join("");
      submitOtpCode({ otpCode });
    }
  }, [otpValue, submitOtpCode]);

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="flex flex-col gap-2 text-center">
        <h3 className="text-xl font-semibold">{ls.loadingOtp.title}</h3>
        <p className="text-fg-secondary text-sm">
          {ls.loadingOtp.body} <strong>{authStep.email}</strong>
        </p>
      </div>

      <OTPInput
        value={otpValue}
        setValue={setOtpValue}
        errorText={errorText}
        setErrorText={setErrorText}
        handleReset={handleReset}
        disabled={isSubmitting}
        isVerified={authStep.status === AuthStepStatus.success}
      />

      {isSubmitting && (
        <div className="flex items-center gap-2 text-fg-secondary">
          <Spinner className="w-4 h-4" />
          <span>{ls.loadingOtp.verifying}</span>
        </div>
      )}

      <div className="flex flex-col gap-2 text-center">
        <p className="text-fg-tertiary text-sm">{ls.loadingOtp.notReceived}</p>
        <Button
          variant="link"
          onClick={handleResend}
          disabled={isResending || isSubmitting}
        >
          {isResending ? ls.loadingOtp.resent : ls.loadingOtp.resend}
        </Button>
      </div>
    </div>
  );
});
