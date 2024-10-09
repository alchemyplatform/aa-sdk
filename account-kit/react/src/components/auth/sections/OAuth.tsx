import { useCallback } from "react";
import { AppleIcon, FacebookIcon, GoogleIcon } from "../../../icons/oauth.js";
import { assertNever } from "../../../utils.js";
import { Button } from "../../button.js";
import { useOAuthVerify } from "../hooks/useOAuthVerify.js";
import type { AuthType } from "../types.js";

type Props = Extract<AuthType, { type: "social" }>;

// Not used externally
// eslint-disable-next-line jsdoc/require-jsdoc
export const OAuth = ({ ...config }: Props) => {
  const { authenticate } = useOAuthVerify();
  const startFlow = useCallback(
    () => authenticate(config),
    [authenticate, config]
  );

  switch (config.authProviderId) {
    case "google":
      return (
        <Button variant="social" icon={<GoogleIcon />} onClick={startFlow}>
          Google
        </Button>
      );
    case "facebook":
      return (
        <Button variant="social" icon={<FacebookIcon />} onClick={startFlow}>
          Facebook
        </Button>
      );
    case "apple":
      return (
        <Button variant="social" icon={<AppleIcon />} onClick={startFlow}>
          Apple
        </Button>
      );
    case "auth0":
      return (
        <Button
          variant="social"
          icon={<img src={config.logoUrl} alt={config.auth0Connection} />}
          onClick={startFlow}
        ></Button>
      );
    default:
      assertNever("unhandled authProviderId passed into auth sections");
  }

  throw Error("unhandled authProviderId passed into auth sections");
};
