import { useConfig } from "@/app/state";
import { cn } from "@/lib/utils";
import { BiometricIcon } from "../icons/biometric";
import { LockIcon } from "../icons/lock";
import { MailIcon } from "../icons/mail";
import { SocialIcon } from "../icons/social";
import { WalletIcon } from "../icons/wallet";
import ExternalLink from "../shared/ExternalLink";
import { Switch } from "../ui/switch";

export const Authentication = ({ className }: { className?: string }) => {
  const { config, setConfig } = useConfig();

  const setPasskeysActive = (active: boolean) => {
    setConfig((prev) => ({
      ...prev,
      auth: {
        ...prev.auth,
        showPasskey: active,
      },
    }));
  };

  const setAddPasskeyOnSignup = (active: boolean) => {
    setConfig((prev) => ({
      ...prev,
      auth: {
        ...prev.auth,
        addPasskey: active,
      },
    }));
  };

  const setWalletsActive = (active: boolean) => {
    setConfig((prev) => ({
      ...prev,
      auth: {
        ...prev.auth,
        showExternalWallets: active,
      },
    }));
  };

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <div className="flex flex-row gap-2 items-center">
        <LockIcon />
        <span className="font-semibold">Authentication</span>
      </div>
      <div className="flex flex-col gap-4">
        <p className="font-medium text-secondary-foreground text-sm">Login</p>
        <div className="flex flex-row flex-wrap gap-3">
          <AuthMethod
            icon={<MailIcon />}
            name="Email"
            active={config.auth.showEmail}
            disabled
          />
          <AuthMethod
            icon={<SocialIcon className="opacity-50" />}
            name="Social"
            unavailable
          />
          <AuthMethod
            className="flex-0 shrink-0 grow min-w-full"
            icon={<BiometricIcon />}
            name="Passkeys"
            details={
              <>
                <div className="flex flex-1 min-w-full flex-row justify-between gap-3 items-center">
                  <p className={cn("font-medium text-sm")}>
                    Add passkey after sign up
                  </p>
                  <Switch
                    disabled={!config.auth.showPasskey}
                    checked={config.auth.addPasskey && config.auth.showPasskey}
                    onCheckedChange={setAddPasskeyOnSignup}
                    className="ml-auto"
                  />
                </div>
                {!config.auth.addPasskey && config.auth.showPasskey && (
                  <p className="text-sm text-secondary-foreground px-2 py-[6px] bg-blue-50 text-brand rounded-lg">
                    Learn how to{" "}
                    <ExternalLink
                      href="https://aa-sdk-site-alpha.vercel.app/react/add-passkey?_vercel_share=1H4QaNdwBWvMQImVSV9VJ0HCyD9J6Msl"
                      className="underline"
                    >
                      add a passkey later
                    </ExternalLink>
                  </p>
                )}
              </>
            }
            active={config.auth.showPasskey}
            setActive={setPasskeysActive}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <p className="font-medium text-secondary-foreground text-sm">Connect</p>
        <AuthMethod
          icon={<WalletIcon className="opacity-50" />}
          name="External wallets"
          active={config.auth.showExternalWallets}
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
}) => {
  return (
    <div
      className={cn(
        "flex flex-col flex-1 border rounded-lg px-4 py-3 relative basis-0.5 gap-3 border-gray-300",
        className
      )}
    >
      <div className={cn("flex flex-1 items-center")}>
        <div className="mt-[2px] flex shrink-0 self-start">{icon}</div>

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
          <div className="ml-auto border border-border/50 px-2 py-1 rounded-sm rounded-tl-none rounded-br-none border-t-0 border-r-0 bg-purple-50 border-purple-50 rounded-tr-lg">
            <p className="text-xs font-semibold text-purple-500">Soon</p>
          </div>
        )}
      </div>
      {callout}
    </div>
  );
};
