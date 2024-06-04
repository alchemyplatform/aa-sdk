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
      <span className="text-lg text-fg-primary font-semibold">
        You're one click away
      </span>
      <div className="flex flex-col items-center justify-center border-fg-accent-brand bg-bg-surface-inset rounded-[100%] w-[56px] h-[56px] border">
        <MailIcon />
      </div>
      <p className="text-fg-secondary text-center font-normal text-sm">
        We've sent a verification link to{" "}
        <strong className="font-medium">{context.email}</strong>.<br />
        Follow the instructions in the email.
      </p>
      <div className="flex flex-row rounded-lg bg-bg-surface-inset justify-between py-2 px-4 w-full items-center text-xs">
        <span className="font-normal text-fg-secondary">
          Didn't receive the email?
        </span>
        <Button
          type="link"
          className="text-xs font-semibold"
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
