import React from "react";
import { CheckIcon } from "../../icons/check";
import { GasIcon } from "../../icons/gas";
import { UserIcon } from "../../icons/user";
import { WalletIcon } from "../../icons/wallet";
import { useLogout } from "@account-kit/react";

export const EOAPostLoginActions = () => {
  const { logout } = useLogout();
  return (
    <div className="flex flex-col items-center justify-center">
      <p className="text-fg-secondary text-sm">
        Want to experience gasless checkout?
      </p>
      <div className="flex flex-col sm:flex-row w-full mt-4">
        <button
          className="btn btn-primary w-full sm:w-auto mb-2 sm:mb-0 flex-1 m-0 sm:mr-2"
          onClick={() => {
            console.log("openAuthModal");
            logout();
          }}
        >
          Try it
        </button>
        <a
          href="https://accountkit.alchemy.com/"
          target="_blank"
          className="btn btn-secondary w-full sm:w-auto flex-1 m-0 sm:ml-2"
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
        <CheckIcon className="w-[48px] h-[48px]" stroke="#16A34A" />
        <h3 className="text-[32px] tracking-tight font-semibold mt-5 text-fg-primary">{`You're connected!`}</h3>
      </div>
      <div className="flex flex-col mt-6">
        <Capabilities
          icon="connect"
          title="Connect existing users"
          description="Reliable wallet connectors make it easy for you to connect all of your existing web3 users"
        />
        <Capabilities
          icon="onboard"
          title="Onboard mainstream users"
          description="Integrate plug-n-play email, social, and passkey login to bring mainstream users onchain"
        />
        <Capabilities
          icon="sponsor"
          title="Sponsor gas fees"
          description="Build gasless transaction flows, available now for embedded wallets and coming soon to EOAs"
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
    <div className="flex gap-3 mb-10">
      {getPropIcon(icon)}
      <div className=" w-full">
        <h3 className="text-base font-semibold text-fg-secondary">{title}</h3>
        <p className="text-base leading-6 text-fg-secondary">{description}</p>
      </div>
    </div>
  );
};

const getPropIcon = (icon: IconType) => {
  switch (icon) {
    case "connect":
      return <WalletIcon className="text-fg-secondary w-[24px] h-[24px]" />;

    case "onboard":
      return <UserIcon className="text-fg-secondary w-[24px] h-[24px]" />;
    case "sponsor":
      return <GasIcon className="text-fg-secondary w-[24px] h-[24px]" />;
  }
};
