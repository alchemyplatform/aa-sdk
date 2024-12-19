import { OauthCancelledError } from "@account-kit/signer";
import { useEffect } from "react";
import { useSignerStatus } from "../../../../hooks/useSignerStatus.js";
import {
  ContinueWithOAuth,
  OAuthConnectionFailed,
} from "../../../../icons/oauth.js";
import { capitalize } from "../../../../utils.js";
import { AuthStepType, useAuthContext } from "../../context.js";
import { useOAuthVerify } from "../../hooks/useOAuthVerify.js";
import { ConnectionError } from "../error/connection-error.js";
import { ls } from "../../../../strings.js";

export const CompletingOAuth = () => {
  const { isConnected } = useSignerStatus();
  const { setAuthStep, authStep } = useAuthContext(
    AuthStepType.oauth_completing
  );
  const { authenticate } = useOAuthVerify({ config: authStep.config });
  const oauthWasCancelled = authStep.error instanceof OauthCancelledError;

  useEffect(() => {
    if (isConnected) {
      setAuthStep({ type: AuthStepType.complete });
    } else if (oauthWasCancelled) {
      setAuthStep({ type: AuthStepType.initial });
    }
  }, [isConnected, oauthWasCancelled, setAuthStep]);

  if (authStep.error && !oauthWasCancelled) {
    return (
      <ConnectionError
        headerText={`${ls.error.connection.oauthTitle} ${capitalize(
          authStep.config.authProviderId
        )}`}
        bodyText={ls.error.connection.oauthBody}
        handleTryAgain={authenticate}
        handleUseAnotherMethod={() =>
          setAuthStep({ type: AuthStepType.initial })
        }
        icon={
          <OAuthConnectionFailed provider={authStep.config.authProviderId} />
        }
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
