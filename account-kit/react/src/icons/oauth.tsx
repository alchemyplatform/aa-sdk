import type { KnownAuthProvider } from "@account-kit/signer";
import { Spinner } from "./spinner.js";
import { GoogleIcon, FacebookIcon, DiscordIcon } from "./auth-icons/index.js";

interface ContinueWithOAuthProps {
  provider: KnownAuthProvider;
}

interface OAuthConnectionFailedWithProps {
  provider: KnownAuthProvider;
}

// TO DO: extend for BYO auth provider
export function ContinueWithOAuth({ provider }: ContinueWithOAuthProps) {
  return (
    <div className="relative flex flex-col items-center justify-center h-12 w-12">
      <Spinner className="absolute top-0 left-0 right-0 bottom-0" />
      {(provider === "google" && <GoogleIcon />) ||
        (provider === "facebook" && <FacebookIcon />) ||
        (provider === "discord" && <DiscordIcon />)}
    </div>
  );
}

// TO DO: extend for BYO auth provider
export function OAuthConnectionFailed({
  provider,
}: OAuthConnectionFailedWithProps) {
  return (
    <div className="relative flex flex-col items-center justify-center h-12 w-12">
      <div className="absolute top-0 left-0 right-0 bottom-0">
        <svg
          width="50"
          height="50"
          viewBox="0 0 50 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="24" cy="24" r="22" stroke="#FECACA" strokeWidth="2.5" />
          <rect x="32" y="32" width="18" height="18" rx="9" fill="#DC2626" />
          <path
            d="M43 39L39 43M43 43L39 39"
            stroke="white"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
        </svg>
      </div>
      {(provider === "google" && <GoogleIcon />) ||
        (provider === "facebook" && <FacebookIcon />) ||
        (provider === "discord" && <DiscordIcon />)}
    </div>
  );
}
