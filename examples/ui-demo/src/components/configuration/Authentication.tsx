import { cn } from "@/lib/utils";
import { useConfigStore } from "@/state";
import { BiometricIcon } from "../icons/biometric";
import { ExternalLinkIcon } from "../icons/external-link";
import { FacebookLogo } from "../icons/facebook";
import { GoogleIcon } from "../icons/google";
import { LockIcon } from "../icons/lock";
import { MailIcon } from "../icons/mail";
import { SocialIcon } from "../icons/social";
import { WalletIcon } from "../icons/wallet";
import ExternalLink from "../shared/ExternalLink";
import { Switch } from "../ui/switch";

export const Authentication = ({ className }: { className?: string }) => {
  const { auth, setAuth } = useConfigStore(({ auth, setAuth }) => ({
    auth,
    setAuth,
  }));

  const setPasskeysActive = (active: boolean) => {
    setAuth({ showPasskey: active });
  };

  const setAddPasskeyOnSignup = (active: boolean) => {
    setAuth({
      addPasskey: active,
    });
  };

  const setWalletsActive = (active: boolean) => {
    setAuth({
      showExternalWallets: active,
    });
  };

  const setOAuthActive = (active: boolean) => {
    setAuth({
      showOAuth: active,
    });
  };

  const setAddGoogleAuth = () => {
    setAuth({
      oAuthMethods: {
        ...auth.oAuthMethods,
        google: !auth.oAuthMethods.google,
      },
    });
  };

  const setAddFacebookAuth = () => {
    setAuth({
      oAuthMethods: {
        ...auth.oAuthMethods,
        facebook: !auth.oAuthMethods.facebook,
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
            disabled
          />
          <AuthMethod
            icon={<SocialIcon />}
            name="Social"
            iconClassName="mt-[2px] self-start"
            details={
              <div className={cn("flex gap-x-3", { hidden: !auth.showOAuth })}>
                <OAuthMethod
                  active={auth.oAuthMethods.google}
                  icon={<GoogleIcon />}
                  onClick={setAddGoogleAuth}
                />
                <OAuthMethod
                  active={auth.oAuthMethods.facebook}
                  icon={<FacebookLogo />}
                  onClick={setAddFacebookAuth}
                />
                <ExternalLink
                  href="https://accountkit.alchemy.com/signer/authentication/auth0"
                  className=" btn rounded-lg border border-border active:bg-demo-surface-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-none"
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
                  <ExternalLink href="https://aa-sdk-site-alpha.vercel.app/react/add-passkey?">
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

      <div className="flex flex-col gap-2 mb-10">
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
            <p
              className={cn("font-medium text-sm", unavailable && "opacity-50")}
            >
              {name}
            </p>
            {!unavailable && (
              <Switch
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
}: {
  icon: React.ReactNode;
  onClick: () => void;
  className?: string;
  active: boolean;
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex grow-0 shrink-0 border border-[#64748B]  rounded-lg p-1 h-10 w-10 justify-center items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        active
          ? "border-[#64748B] bg-demo-surface-secondary"
          : "border-gray-300"
      )}
    >
      {icon}
    </button>
  );
};
