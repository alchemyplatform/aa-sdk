import { useEffect } from "react";
import { useSignerStatus } from "../../../../hooks/useSignerStatus.js";
import { ContinueWithOAuth } from "../../../../icons/oauth.js";
import { capitalize } from "../../../../utils.js";
import { useAuthContext } from "../../context.js";
import { useOAuthVerify } from "../../hooks/useOAuthVerify.js";
import { ConnectionError } from "../error/connection-error.js";

export const CompletingOAuth = () => {
  const { isConnected } = useSignerStatus();
  const { setAuthStep, authStep } = useAuthContext("oauth_completing");
  const { authenticate } = useOAuthVerify({ config: authStep.config });

  useEffect(() => {
    if (isConnected) {
      if (authStep.createPasskeyAfter) {
        setAuthStep({ type: "passkey_create" });
      } else {
        setAuthStep({ type: "complete" });
      }
    }
  }, [authStep.createPasskeyAfter, isConnected, setAuthStep]);

  if (authStep.error) {
    return (
      <ConnectionError
        connectionType="oauth"
        oauthProvider={authStep.config!.authProviderId}
        handleTryAgain={authenticate}
        handleUseAnotherMethod={() => setAuthStep({ type: "initial" })}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5 items-center">
      <div className="flex flex-col items-center justify-center">
        <ContinueWithOAuth provider={authStep.config.authProviderId} />
      </div>

      <h3 className="font-semibold text-lg">{`Continue with ${capitalize(
        authStep.config.authProviderId
      )}`}</h3>
      <p className="text-fg-secondary text-center text-sm">
        {`Follow the steps in the pop up window to sign in with ${capitalize(
          authStep.config.authProviderId
        )}`}
      </p>
    </div>
  );
};
