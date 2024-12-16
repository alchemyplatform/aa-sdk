import { useEffect, useState } from "react";
import { useAuthenticate } from "../../../../hooks/useAuthenticate.js";
import { ls } from "../../../../strings.js";
import { useAuthContext, type AuthStep } from "../../context.js";
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
      <span className="text-fg-tertiary text-xs">
        {ls.loadingEmail.emailNotReceived}
      </span>
      <Button
        variant="link"
        className="text-xs font-normal underline"
        disabled={emailResent}
        onClick={() => {
          authenticate({
            type: "email",
            email: authStep.email,
            emailMode: authStep.type === "email_verify" ? "magicLink" : "otp",
          });
          setEmailResent(true);
        }}
      >
        {emailResent ? ls.loadingEmail.resent : ls.loadingEmail.resend}
      </Button>
    </div>
  );
};
