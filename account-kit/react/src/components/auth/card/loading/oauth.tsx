import { OauthCancelledError } from "@account-kit/signer";
import { useEffect } from "react";
import { useSignerStatus } from "../../../../hooks/useSignerStatus.js";
import {
  ContinueWithOAuth,
  OAuthConnectionFailed,
} from "../../../../icons/oauth.js";
import { useAuthContext } from "../../context.js";
import { useOAuthVerify } from "../../hooks/useOAuthVerify.js";
import { ConnectionError } from "../error/connection-error.js";
import { ls } from "../../../../strings.js";
import { getSocialProviderDisplayName } from "../../types.js";

export const CompletingOAuth = () => {
  const { isConnected } = useSignerStatus();
  const { setAuthStep, authStep } = useAuthContext("oauth_completing");
  const { authenticate } = useOAuthVerify({ config: authStep.config });
  const oauthWasCancelled = authStep.error instanceof OauthCancelledError;

  useEffect(() => {
    if (isConnected) {
      setAuthStep({ type: "complete" });
    } else if (oauthWasCancelled) {
      setAuthStep({ type: "initial" });
    }
  }, [isConnected, oauthWasCancelled, setAuthStep]);

  if (authStep.error && !oauthWasCancelled) {
    return (
      <ConnectionError
        headerText={`${
          ls.error.connection.oauthTitle
        } ${getSocialProviderDisplayName(authStep.config)}`}
        bodyText={ls.error.connection.oauthBody}
        handleTryAgain={authenticate}
        handleUseAnotherMethod={() => setAuthStep({ type: "initial" })}
        icon={
          <OAuthConnectionFailed
            provider={authStep.config.authProviderId}
            auth0Connection={authStep.config.auth0Connection}
            logoUrl={authStep.config.logoUrl}
            logoUrlDark={authStep.config.logoUrlDark}
          />
        }
      />
    );
  }

  const providerDisplayName = getSocialProviderDisplayName(authStep.config);
  return (
    <div className="flex flex-col gap-5 items-center">
      <div className="flex flex-col items-center justify-center">
        <ContinueWithOAuth provider={authStep.config.authProviderId} />
      </div>

      <h3 className="font-semibold text-lg">{`Continue with ${providerDisplayName}`}</h3>
      <p className="text-fg-secondary text-center text-sm">
        {`Follow the steps in the pop up window to sign in with ${providerDisplayName}`}
      </p>
    </div>
  );
};
