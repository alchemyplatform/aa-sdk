import { cn } from "@/lib/utils";
import { Metrics } from "@/metrics";
import { useConfigStore } from "@/state";
import { BiometricIcon } from "../icons/biometric";
import { ExternalLinkIcon } from "../icons/external-link";
import { FacebookIcon } from "../icons/facebook";
import { GoogleIcon } from "../icons/google";
import { DiscordLogo } from "../icons/discord";
import { LockIcon } from "../icons/lock";
import { MailIcon } from "../icons/mail";
import { SocialIcon } from "../icons/social";
import { TwitterIcon } from "../icons/twitter";
import { WalletIcon } from "../icons/wallet";
import ExternalLink from "../shared/ExternalLink";
import { Switch } from "../ui/switch";
import { links } from "@/utils/links";
import { TwitchIcon } from "../icons/twitch";

export const Authentication = ({ className }: { className?: string }) => {
  const { auth, setAuth } = useConfigStore(({ auth, setAuth }) => ({
    auth,
    setAuth,
  }));
  const setEmailAuth = (active: boolean) => {
    setAuth({ showEmail: active });
    Metrics.trackEvent({
      name: "authentication_toggled",
      data: { auth_type: "email", enabled: active },
    });
  };

  const setPasskeysActive = (active: boolean) => {
    setAuth({ showPasskey: active });
    Metrics.trackEvent({
      name: "authentication_toggled",
      data: { auth_type: "passkeys", enabled: active },
    });
  };

  const setAddPasskeyOnSignup = (active: boolean) => {
    setAuth({
      addPasskey: active,
    });
    Metrics.trackEvent({
      name: "authentication_toggled",
      data: { auth_type: "add_passkey_on_signup", enabled: active },
    });
  };

  const setWalletsActive = (active: boolean) => {
    setAuth({
      showExternalWallets: active,
    });
    Metrics.trackEvent({
      name: "authentication_toggled",
      data: { auth_type: "external_wallets", enabled: active },
    });
  };

  const setOAuthActive = (active: boolean) => {
    setAuth({
      showOAuth: active,
    });
    Metrics.trackEvent({
      name: "authentication_toggled",
      data: { auth_type: "oauth", enabled: active },
    });
  };

  const setAddGoogleAuth = () => {
    setAuth({
      oAuthMethods: {
        ...auth.oAuthMethods,
        google: !auth.oAuthMethods.google,
      },
    });
    Metrics.trackEvent({
      name: "authentication_toggled",
      data: { auth_type: "oauth_google", enabled: !auth.oAuthMethods.google },
    });
  };

  const setAddFacebookAuth = () => {
    setAuth({
      oAuthMethods: {
        ...auth.oAuthMethods,
        facebook: !auth.oAuthMethods.facebook,
      },
    });
    Metrics.trackEvent({
      name: "authentication_toggled",
      data: {
        auth_type: "oauth_facebook",
        enabled: !auth.oAuthMethods.facebook,
      },
    });
  };

  const setAddDiscordAuth = () => {
    setAuth({
      oAuthMethods: {
        ...auth.oAuthMethods,
        discord: !auth.oAuthMethods.discord,
      },
    });
    Metrics.trackEvent({
      name: "authentication_toggled",
      data: {
        auth_type: "oauth_discord",
        enabled: !auth.oAuthMethods.discord,
      },
    });
  };

  const setAddTwitterAuth = () => {
    setAuth({
      oAuthMethods: {
        ...auth.oAuthMethods,
        twitter: !auth.oAuthMethods.twitter,
      },
    });
    Metrics.trackEvent({
      name: "authentication_toggled",
      data: {
        auth_type: "oauth_twitter",
        enabled: !auth.oAuthMethods.twitter,
      },
    });
  };

  const setAddTwitchAuth = () => {
    setAuth({
      oAuthMethods: {
        ...auth.oAuthMethods,
        twitch: !auth.oAuthMethods.twitch,
      },
    });
    Metrics.trackEvent({
      name: "authentication_toggled",
      data: {
        auth_type: "oauth_twitch",
        enabled: !auth.oAuthMethods.twitch,
      },
    });
  };

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <div className="flex flex-row gap-2 items-center">
        <LockIcon />
        <span className="font-semibold">Authentication</span>
      </div>
      <div className="flex flex-col gap-2">
        <p className="font-medium text-secondary-foreground text-sm">Login</p>
        <div className="flex flex-col gap-3">
          <AuthMethod
            icon={<MailIcon />}
            name="Email"
            active={auth.showEmail}
            setActive={setEmailAuth}
          />
          <AuthMethod
            icon={<SocialIcon />}
            name="Social"
            iconClassName="mt-[2px] self-start"
            details={
              <div
                className={cn({
                  hidden: !auth.showOAuth,
                })}
              >
                <div className="flex gap-x-3">
                  <OAuthMethod
                    active={auth.oAuthMethods.google}
                    icon={<GoogleIcon />}
                    onClick={setAddGoogleAuth}
                    name="Google"
                  />
                  <OAuthMethod
                    active={auth.oAuthMethods.facebook}
                    icon={<FacebookIcon />}
                    onClick={setAddFacebookAuth}
                    name="Facebook"
                  />
                  <OAuthMethod
                    active={auth.oAuthMethods.discord}
                    icon={<DiscordLogo />}
                    onClick={setAddDiscordAuth}
                    name="Discord"
                  />
                  <OAuthMethod
                    active={auth.oAuthMethods.twitter}
                    icon={<TwitterIcon />}
                    onClick={setAddTwitterAuth}
                    name="Twitter"
                  />
                  <OAuthMethod
                    active={auth.oAuthMethods.twitch}
                    icon={<TwitchIcon />}
                    onClick={setAddTwitchAuth}
                    name="Twitch"
                  />
                </div>
                <div className="w-full pt-3">
                  <ExternalLink
                    href={links.auth0}
                    onClick={() => {
                      Metrics.trackEvent({
                        name: "clicked_custom_oauth_link",
                      });
                    }}
                    className="akui-btn rounded-lg border border-border active:bg-demo-surface-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-none w-full"
                  >
                    <p className="hidden lg:block font-normal text-sm text-secondary-foreground">
                      Custom
                    </p>
                    <ExternalLinkIcon
                      height={16}
                      width={16}
                      className="stroke-demo-fg-secondary"
                    />
                  </ExternalLink>
                </div>
              </div>
            }
            active={auth.showOAuth}
            setActive={setOAuthActive}
          />
          <AuthMethod
            className="flex-0 shrink-0 grow min-w-full"
            icon={<BiometricIcon />}
            iconClassName="mt-[2px] self-start"
            name="Passkeys"
            details={
              <>
                <div className="flex flex-1 min-w-full flex-row justify-between gap-3 lg:items-center">
                  <p className="hidden lg:block font-normal text-sm text-secondary-foreground">
                    Add passkey after sign up
                  </p>
                  <ExternalLink href={links.passkey}>
                    <p className=" block lg:hidden font-normal text-sm text-secondary-foreground underline">
                      Add passkey after sign up
                    </p>
                    <ExternalLinkIcon
                      height={16}
                      width={16}
                      className="stroke-demo-fg-secondary hidden lg:block"
                    />
                  </ExternalLink>
                  <Switch
                    disabled={!auth.showPasskey}
                    checked={auth.addPasskey && auth.showPasskey}
                    onCheckedChange={setAddPasskeyOnSignup}
                    className="ml-auto"
                  />
                </div>
              </>
            }
            active={auth.showPasskey}
            setActive={setPasskeysActive}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-6">
        <p className="font-medium text-secondary-foreground text-sm">Connect</p>
        <AuthMethod
          icon={<WalletIcon className="stroke-demo-fg-primary" />}
          name="External wallets"
          active={auth.showExternalWallets}
          setActive={setWalletsActive}
        />
      </div>
    </div>
  );
};

const AuthMethod = ({
  icon,
  name,
  details = null,
  active = false,
  disabled = false,
  unavailable = false,
  setActive,
  className,
  callout,
  iconClassName,
}: {
  icon: React.ReactNode;
  name: string;
  details?: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  unavailable?: boolean;
  setActive?: (active: boolean) => void;
  className?: string;
  callout?: React.ReactNode;
  iconClassName?: string;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col flex-1 border rounded-lg px-4 py-3 relative basis-0.5 gap-3 border-gray-300",
        className
      )}
    >
      <div className={cn("flex flex-1 items-center")}>
        <div className={cn("flex shrink-0", iconClassName)}>{icon}</div>
        <div className="ml-2 flex-1 flex flex-col gap-3">
          <div className="flex flex-1 min-w-full flex-row justify-between items-center">
            <label
              className={cn("font-medium text-sm", unavailable && "opacity-50")}
              htmlFor={`${name}-auth-method`}
            >
              {name}
            </label>
            {!unavailable && (
              <Switch
                id={`${name}-auth-method`}
                disabled={disabled}
                checked={active}
                onCheckedChange={setActive}
                className="ml-auto"
              />
            )}
          </div>
          {details}
        </div>

        {unavailable && (
          <div className="ml-auto border px-2 py-1 rounded-sm bg-purple-50 border-purple-50">
            <p className="text-xs font-semibold text-purple-500">Soon</p>
          </div>
        )}
      </div>
      {callout}
    </div>
  );
};

const OAuthMethod = ({
  icon,
  onClick,
  active,
  name,
}: {
  icon: React.ReactNode;
  onClick: () => void;
  className?: string;
  active: boolean;
  name: string;
}) => {
  return (
    <button
      onClick={onClick}
      aria-label={`${name} social authentication toggle`}
      className={cn(
        "flex border border-[#64748B]  rounded-lg p-1 h-10 w-full justify-center items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        active
          ? "border-[#64748B] bg-demo-surface-secondary"
          : "border-gray-300"
      )}
    >
      {icon}
    </button>
  );
};
