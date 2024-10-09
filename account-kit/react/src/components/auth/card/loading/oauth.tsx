import { useEffect } from "react";
import { useSignerStatus } from "../../../../hooks/useSignerStatus.js";
import { useAuthContext, type AuthStep } from "../../context.js";
import { ContinueWithOAuth } from "../../../../icons/oauth.js";
import { ConnectionError } from "../error/connection-error.js";
import { capitalize } from "../../../../utils.js";

interface CompletingOAuthProps {
  authStep: Extract<AuthStep, { type: "oauth_completing" }>;
}

export const CompletingOAuth = ({ authStep }: CompletingOAuthProps) => {
  const { isConnected } = useSignerStatus();
  const { setAuthStep } = useAuthContext();

  useEffect(() => {
    if (isConnected) {
      setAuthStep({ type: "complete" });
    }
  }, [isConnected, setAuthStep]);

  if (authStep.error) {
    return (
      <ConnectionError
        connectionType="oauth"
        oauthProvider={authStep.provider}
        handleUseAnotherMethod={() => setAuthStep({ type: "complete" })}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5 items-center">
      <div className="flex flex-col items-center justify-center">
        <ContinueWithOAuth />
      </div>

      <h3 className="font-semibold text-lg">{`Continue with ${capitalize(
        authStep.provider
      )}`}</h3>
      <p className="text-fg-secondary text-center text-sm">
        {`Follow the steps in the pop up window to sign in with ${capitalize(
          authStep.provider
        )}`}
      </p>
    </div>
  );
};
