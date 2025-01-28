import { useLogout } from "@account-kit/react";
import { CheckIcon } from "../icons/check";
import { GasIcon } from "../icons/gas";
import { UserIcon } from "../icons/user";
import { WalletIcon } from "../icons/wallet";

export const EOAPostLoginActions = () => {
  const { logout } = useLogout();
  return (
    <div className="flex flex-col items-center justify-center px-6 lg:px-0">
      <p className="text-demo-fg-secondary lg:text-fg-secondary text-sm text-center mt-4 lg:mt-0">
        <span>
          Want to experience{" "}
          <span
            style={{
              background: "linear-gradient(132deg, #FF9C27 0%, #FD48CE 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            gasless checkout?
          </span>
        </span>
        <br />
        <span>Login with an email instead</span>
      </p>
      <div className="flex flex-col lg:flex-row w-full mt-4">
        <button
          className="akui-btn akui-btn-primary w-full lg:w-auto mb-4 lg:mb-0 flex-1 m-0 lg:mr-2"
          onClick={() => {
            logout();
          }}
        >
          Switch Login
        </button>
        <a
          href="https://accountkit.alchemy.com/"
          target="_blank"
          className="akui-btn akui-btn-secondary w-full lg:w-auto flex-1 m-0 lg:ml-2"
        >
          View docs
        </a>
      </div>
    </div>
  );
};

export const EOAPostLoginContents = () => {
  return (
    <div className="flex flex-col">
      <div className="flex flex-col items-center justify-center">
        <CheckIcon className="w-[48px] h-[48px] stroke-demo-surface-success" />
        <h3 className="text-[32px] tracking-tight font-semibold mt-5 text-fg-primary whitespace-nowrap">{`You're connected!`}</h3>
      </div>
      <div className="flex flex-col mt-6 mx-3.5 lg:mx-0">
        <Capabilities
          icon="connect"
          title="Connect existing users"
          description={
            <>
              <p className="hidden lg:block">
                Reliable wallet connectors make it easy for you to connect all
                of your existing web3 users
              </p>
              <p className="block lg:hidden">
                Reliable wallet connectors make it easy to connect your existing
                users
              </p>
            </>
          }
        />
        <Capabilities
          icon="onboard"
          title="Onboard mainstream users"
          description={
            <>
              <p className="hidden lg:block">
                Embedded wallets with email, social, and passkey local to bring
                mainstream users onchain
              </p>
              <p className="block lg:hidden">
                Embedded wallets with email, social, and passkey to bring users
                onchain
              </p>
            </>
          }
        />
        <Capabilities
          icon="sponsor"
          title="Sponsor gas fees"
          description={
            <>
              <p className="hidden lg:block">
                Gasless transactions available now for embedded wallets and
                coming soon to EOAs
              </p>
              <p className="block lg:hidden">
                Gasless transactions available now for embedded wallets and
                coming soon to EOAs
              </p>
            </>
          }
        />
      </div>
    </div>
  );
};

type IconType = "connect" | "onboard" | "sponsor";

const Capabilities = ({
  icon,
  title,
  description,
}: {
  icon: IconType;
  title: string;
  description: string | JSX.Element;
}) => {
  return (
    <div className="flex gap-3 mb-6 lg:mb-10">
      {getPropIcon(icon)}
      <div className=" w-full">
        <h3 className="text-base font-semibold text-fg-secondary">{title}</h3>
        <div className="text-base leading-6 text-fg-secondary">
          {description}
        </div>
      </div>
    </div>
  );
};

const getPropIcon = (icon: IconType) => {
  switch (icon) {
    case "connect":
      return <WalletIcon className="stroke-fg-secondary w-[24px] h-[24px]" />;
    case "onboard":
      return <UserIcon className="stroke-fg-secondary w-[24px] h-[24px]" />;
    case "sponsor":
      return <GasIcon className="stroke-fg-secondary w-[24px] h-[24px]" />;
  }
};
