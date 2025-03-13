import { memo } from "react";
import {
  AppleIcon,
  FacebookIcon,
  GoogleIcon,
  TwitchIcon,
} from "../../../icons/auth-icons/index.js";
import { assertNever } from "../../../utils.js";
import { Button } from "../../button.js";
import { useOAuthVerify } from "../hooks/useOAuthVerify.js";
import type { AuthType } from "../types.js";

type Props = Extract<AuthType, { type: "social" }>;

// Not used externally
// eslint-disable-next-line jsdoc/require-jsdoc
export const OAuth = memo(({ ...config }: Props) => {
  const { authenticate } = useOAuthVerify({ config });

  switch (config.authProviderId) {
    case "google":
      return (
        <Button
          variant="social"
          icon={<GoogleIcon />}
          onClick={authenticate}
          aria-label="Google sign in"
        >
          Google
        </Button>
      );
    case "facebook":
      return (
        <Button
          variant="social"
          icon={<FacebookIcon />}
          onClick={authenticate}
          aria-label="Facebook sign in"
        >
          Facebook
        </Button>
      );
    case "apple":
      return (
        <Button
          variant="social"
          icon={<AppleIcon />}
          onClick={authenticate}
          aria-label="Apple sign in"
        >
          Apple
        </Button>
      );
    case "twitch":
      return (
        <Button
          variant="social"
          icon={<TwitchIcon />}
          onClick={authenticate}
          aria-label="Twitch sign in"
        >
          Twitch
        </Button>
      );
    case "auth0":
      return (
        <Button
          variant="social"
          icon={
            <>
              <img
                src={config.logoUrl}
                alt={config.auth0Connection}
                className="dark:hidden"
              />
              <img
                // Fallback to light logo if no dark logo provided.
                src={config.logoUrlDark ?? config.logoUrl}
                alt={config.auth0Connection}
                className="hidden dark:block"
              />
            </>
          }
          onClick={authenticate}
          aria-label={`${config.displayName} sign in`}
        >
          {config.displayName}
        </Button>
      );
    default:
      assertNever(
        config,
        `unhandled authProviderId ${
          (config as any).authProviderId
        } passed into auth sections`
      );
  }
});
