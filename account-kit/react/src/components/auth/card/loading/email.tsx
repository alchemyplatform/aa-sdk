import { useEffect, useState } from "react";
import { useSignerStatus } from "../../../../hooks/useSignerStatus.js";
import { useAuthContext, type AuthStep } from "../../context.js";
import { Spinner } from "../../../../icons/spinner.js";
import { ls } from "../../../../strings.js";
import { EmailIllustration } from "../../../../icons/illustrations/email.js";

interface LoadingEmailProps {
  authStep: Extract<AuthStep, { type: "email_verify" }>;
}

// eslint-disable-next-line jsdoc/require-jsdoc
export const LoadingEmail = ({ authStep }: LoadingEmailProps) => {
  // yup, re-sent and resent. I'm not fixing it
  const [emailResent, setEmailResent] = useState(false);

  useEffect(() => {
    if (emailResent) {
      // set the text back to "Resend" after 2 seconds
      setTimeout(() => {
        setEmailResent(false);
      }, 2000);
    }
  }, [emailResent]);

  return (
    <div className="flex flex-col gap-5 items-center">
      <div className="flex flex-col items-center justify-center h-12 w-12">
        <EmailIllustration height="48" width="48" className="animate-pulse" />
      </div>

      <h3 className="font-semibold text-lg">{ls.loadingEmail.title}</h3>
      <p className="text-fg-secondary text-center text-sm">
        {ls.loadingEmail.verificationSent}
        <br />
        <span className="font-medium">{authStep.email}</span>
      </p>
    </div>
  );
};

interface CompletingEmailAuthProps {
  authStep: Extract<AuthStep, { type: "email_completing" }>;
}

// eslint-disable-next-line jsdoc/require-jsdoc
export const CompletingEmailAuth = ({ authStep }: CompletingEmailAuthProps) => {
  const { isConnected } = useSignerStatus();
  const { setAuthStep } = useAuthContext();

  useEffect(() => {
    if (isConnected && authStep.createPasskeyAfter) {
      setAuthStep({ type: "passkey_create" });
    } else if (isConnected) {
      setAuthStep({ type: "complete" });
    }
  }, [authStep.createPasskeyAfter, isConnected, setAuthStep]);

  return (
    <div className="flex flex-col gap-5 items-center">
      <div className="flex flex-col items-center justify-center h-12 w-12">
        <Spinner />
      </div>

      <p className="text-fg-secondary text-center text-sm">
        {ls.completingEmail.body}
      </p>
    </div>
  );
};
