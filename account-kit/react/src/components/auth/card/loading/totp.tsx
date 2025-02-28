import { useState } from "react";
import { useAuthContext } from "../../context.js";
import { useAuthenticate } from "../../../../hooks/useAuthenticate.js";
import { Button } from "../../../button.js";
import { OTPInput, initialOTPValue } from "../../../otp-input/otp-input.js";

export const LoadingTotp = () => {
  const { authStep, setAuthStep } = useAuthContext("totp_verify");
  const [totpCode, setTotpCode] = useState(initialOTPValue);
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
      <h3 className="text-lg font-semibold">Enter your TOTP Code</h3>
      <p className="text-fg-secondary text-sm">
        Check your authenticator app for a 6-digit code.
      </p>
      <OTPInput
        value={totpCode}
        setValue={(val) => {
          setTotpCode(val);
          if (val.every((v) => v !== "")) {
            handleVerify(val.join(""));
          }
        }}
        errorText={errorText}
        setErrorText={setErrorText}
        disabled={isPending}
        handleReset={() => setTotpCode(initialOTPValue)}
      />
      <Button
        onClick={() => handleVerify(totpCode.join(""))}
        disabled={isPending}
      >
        Verify TOTP
      </Button>
    </div>
  );
};
