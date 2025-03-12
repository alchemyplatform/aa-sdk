import { useEffect, useMemo, useState } from "react";
import { useAuthenticate } from "../../../../hooks/useAuthenticate.js";
import { ls } from "../../../../strings.js";
import {
  AuthStepStatus,
  useAuthContext,
  type AuthStep,
} from "../../context.js";
import { Button } from "../../../button.js";

type EmailNotReceivedDisclaimerProps = {
  authStep: Extract<AuthStep, { type: "email_verify" | "otp_verify" }>;
};
export const EmailNotReceivedDisclaimer = ({
  authStep,
}: EmailNotReceivedDisclaimerProps) => {
  const { setAuthStep } = useAuthContext();
  const [emailResent, setEmailResent] = useState(false);
  const { authenticate } = useAuthenticate({
    onSuccess: () => {
      setAuthStep({ type: "complete" });
    },
  });

  const isOTPVerifying = useMemo(() => {
    return (
      authStep.type === "otp_verify" &&
      (authStep.status === AuthStepStatus.verifying ||
        authStep.status === AuthStepStatus.success)
    );
  }, [authStep]);

  useEffect(() => {
    if (emailResent) {
      // set the text back to "Resend" after 2 seconds
      setTimeout(() => {
        setEmailResent(false);
      }, 2000);
    }
  }, [emailResent]);

  return (
    <div className="flex flex-row gap-2 justify-center mb-2">
      <span
        className={`${
          isOTPVerifying ? "text-fg-disabled" : "text-fg-tertiary"
        } text-xs`}
      >
        {ls.loadingEmail.emailNotReceived}
      </span>
      <Button
        variant="link"
        className={`text-xs font-normal underline ${
          isOTPVerifying
            ? "text-fg-disabled disabled:opacity-100"
            : "text-btn-primary"
        }`}
        disabled={emailResent || isOTPVerifying}
        onClick={() => {
          authenticate({
            type: "email",
            email: authStep.email,
          });
          setEmailResent(true);
        }}
      >
        {emailResent ? ls.loadingEmail.resent : ls.loadingEmail.resend}
      </Button>
    </div>
  );
};
