import { useEffect, useState } from "react";
import { useAuthenticate } from "../../../../hooks/useAuthenticate.js";
import { useSignerStatus } from "../../../../hooks/useSignerStatus.js";
import { MailIllustration } from "../../../../icons/mail.js";
import { Button } from "../../../button.js";
import { PoweredBy } from "../../../poweredby.js";
import { useAuthContext, type AuthStep } from "../../context.js";
import { Spinner } from "../../../../icons/spinner.js";
import { ls } from "../../../../strings.js";

interface LoadingEmailProps {
  context: Extract<AuthStep, { type: "email_verify" }>;
}

// eslint-disable-next-line jsdoc/require-jsdoc
export const LoadingEmail = ({ context }: LoadingEmailProps) => {
  // yup, re-sent and resent. I'm not fixing it
  const [emailResent, setEmailResent] = useState(false);
  const { setAuthStep } = useAuthContext();
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
    <div className="flex flex-col gap-5 items-center">
      <div className="flex flex-col items-center justify-center h-12 w-12">
        <MailIllustration className="animate-pulse" />
      </div>

      <h3 className="font-semibold text-lg">{ls.loadingEmail.title}</h3>
      <p className="text-fg-secondary text-center text-sm">
        {ls.loadingEmail.verificationSent}
        <br />
        <span className="font-medium">{context.email}</span>
      </p>

      <div className="flex flex-col w-full items-center gap-1">
        <div className="flex items-center justify-center py-2 gap-x-2">
          <p className="text-fg-tertiary text-xs">
            {ls.loadingEmail.emailNotReceived}
          </p>
          <Button
            variant="link"
            className="text-xs font-normal underline"
            onClick={() => {
              authenticate({
                type: "email",
                email: context.email,
              });
              setEmailResent(true);
            }}
          >
            {emailResent ? ls.loadingEmail.resent : ls.loadingEmail.resend}
          </Button>
        </div>
        <PoweredBy />
      </div>
    </div>
  );
};

interface CompletingEmailAuthProps {
  context: Extract<AuthStep, { type: "email_completing" }>;
}

// eslint-disable-next-line jsdoc/require-jsdoc
export const CompletingEmailAuth = ({ context }: CompletingEmailAuthProps) => {
  const { isConnected } = useSignerStatus();
  const { setAuthStep } = useAuthContext();

  useEffect(() => {
    if (isConnected && context.createPasskeyAfter) {
      setAuthStep({ type: "passkey_create" });
    } else if (isConnected) {
      setAuthStep({ type: "complete" });
    }
  }, [context.createPasskeyAfter, isConnected, setAuthStep]);

  return (
    <div className="flex flex-col gap-5 items-center">
      <div className="flex flex-col items-center justify-center h-12 w-12">
        <Spinner />
      </div>

      <p className="text-fg-secondary text-center text-sm">
        {ls.completingEmail.body}
      </p>

      <PoweredBy />
    </div>
  );
};
