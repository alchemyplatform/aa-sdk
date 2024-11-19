import { useEffect, useState } from "react";
import { useSignerStatus } from "../../../../hooks/useSignerStatus.js";
import { EmailIllustration } from "../../../../icons/illustrations/email.js";
import { Spinner } from "../../../../icons/spinner.js";
import { ls } from "../../../../strings.js";
import { useAuthContext } from "../../context.js";
import { DemoInput } from "./demoInput.js";
import { Button } from "../../../button.js";
import { useAuthenticate } from "../../../../hooks/useAuthenticate.js";
import { ConnectionError } from "../error/connection-error.js";
import { ConnectionFailed } from "../../../../icons/connectionFailed.jsx";

// eslint-disable-next-line jsdoc/require-jsdoc
export const LoadingOtp = () => {
  const { authStep } = useAuthContext("otp_verify");
  const [otpCode, setOtpCode] = useState("");
  const { setAuthStep } = useAuthContext();

  const { authenticate } = useAuthenticate({
    onMutate: () => {
      setAuthStep({ type: "otp_completing", email: authStep.email });
    },
    onError: (error: any) => {
      console.error(error);
      setAuthStep({ type: "otp_completing", email: authStep.email, error });
    },
    onSuccess: () => {
      setAuthStep({ type: "complete" });
    },
  });

  return (
    <div className="flex flex-col gap-5 items-center">
      <div className="flex flex-col items-center justify-center h-12 w-12">
        <EmailIllustration height="48" width="48" className="animate-pulse" />
      </div>

      <h3 className="font-semibold text-lg">{ls.loadingEmail.title}</h3>
      <DemoInput
        value={otpCode}
        onChange={(event) => setOtpCode(event.currentTarget.value)}
      />
      <Button
        onClick={() => {
          authenticate({ type: "otp", otpCode });
        }}
      >
        Enter code
      </Button>
      <p className="text-fg-secondary text-center text-sm">
        We sent a code to
        <br />
        <span className="font-medium">{authStep.email}</span>
      </p>
    </div>
  );
};

// eslint-disable-next-line jsdoc/require-jsdoc
export const CompletingOtpAuth = () => {
  const { isConnected } = useSignerStatus();
  const { authenticate } = useAuthenticate();
  const { setAuthStep, authStep } = useAuthContext("otp_completing");

  useEffect(() => {
    if (isConnected && authStep.createPasskeyAfter) {
      setAuthStep({ type: "passkey_create" });
    } else if (isConnected) {
      setAuthStep({ type: "complete" });
    }
  }, [authStep.createPasskeyAfter, isConnected, setAuthStep]);

  if (authStep.error) {
    return (
      <ConnectionError
        headerText={ls.error.connection.otpTitle}
        bodyText={ls.error.connection.otpBody}
        icon={<ConnectionFailed />}
        handleTryAgain={() => {
          const { email } = authStep;
          setAuthStep({ type: "otp_verify", email });
          authenticate({ type: "email", email, emailMode: "otp" });
        }}
        handleUseAnotherMethod={() => setAuthStep({ type: "initial" })}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5 items-center">
      <div className="flex flex-col items-center justify-center h-12 w-12">
        <Spinner />
      </div>

      <p className="text-fg-secondary text-center text-sm">
        {ls.completingOtp.body}
      </p>
    </div>
  );
};
