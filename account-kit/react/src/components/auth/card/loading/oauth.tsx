import { useEffect } from "react";
import { useSignerStatus } from "../../../../hooks/useSignerStatus.js";
import { useAuthContext, type AuthStep } from "../../context.js";
import { ContinueWithOAuth } from "../../../../icons/oauth.js";
import { ConnectionError } from "../error/connection-error.js";

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
        handleUseAnotherMethod={() => setAuthStep({ type: "complete" })}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5 items-center">
      <div className="flex flex-col items-center justify-center">
        <ContinueWithOAuth />
      </div>

      <h3 className="font-semibold text-lg">{`Continue with ${authStep.provider}`}</h3>
      <p className="text-fg-secondary text-center text-sm">
        {`Follow the steps in the pop up window to sign in with ${authStep.provider}`}
      </p>

      <div className="flex flex-col w-full items-center gap-1">
        {/* Hidden until we can read in support URLs from the config */}
        {/* <div className="flex items-center justify-center py-2 gap-x-1">
        <p className="text-fg-tertiary text-xs">
          {ls.loadingPasskey.supportText}
        </p>
        <Button variant="link" className="text-xs font-normal underline">
          {ls.loadingPasskey.supportLink}
        </Button>
      </div> */}
      </div>
    </div>
  );
};
