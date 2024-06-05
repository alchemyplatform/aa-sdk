import { useEffect, useState } from "react";
import { useAuthenticate } from "../../../../hooks/useAuthenticate.js";
import { useSignerStatus } from "../../../../hooks/useSignerStatus.js";
import { HourglassIcon } from "../../../../icons/hourglass.js";
import { MailIcon } from "../../../../icons/mail.js";
import { Button } from "../../../button.js";
import { PoweredBy } from "../../../poweredby.js";
import { useAuthContext, type AuthStep } from "../../context.js";

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
      <div className="flex flex-col items-center justify-center border-fg-accent-brand bg-bg-surface-inset rounded-[100%] w-[56px] h-[56px] border">
        <MailIcon />
      </div>
      <h3 className="font-semibold text-lg">You&apos;re one click away</h3>
      <p className="text-fg-secondary text-center text-sm">
        We sent a verification link to{" "}
        <span className="font-medium">{context.email}</span>.<br />
        Click the link to log in.
      </p>

      <div className="flex flex-col w-full items-center gap-1">
        <div className="flex items-center justify-center py-2 gap-x-2">
          <p className="text-fg-tertiary text-xs">
            Didn&apos;t receive the email?
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
            {emailResent ? "Done!" : "Resend"}
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
      <span className="text-lg text-fg-primary font-semibold">
        Completing authorization
      </span>
      <div className="flex flex-col items-center justify-center border-fg-accent-brand bg-bg-surface-inset rounded-[100%] w-[56px] h-[56px] border">
        <HourglassIcon />
      </div>
      <p className="text-fg-secondary text-center font-normal text-sm">
        Your email verification is almost complete. Please wait a few seconds
        for this screen to update.
      </p>
      <PoweredBy />
    </div>
  );
};
