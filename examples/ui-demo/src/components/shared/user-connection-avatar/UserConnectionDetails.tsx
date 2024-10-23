import { ExternalLinkIcon } from "@/components/icons/external-link";
import { LogoutIcon } from "@/components/icons/logout";
import { DeploymentStatusIndicator } from "@/components/shared/DeploymentStatusIndicator";
import { UserAddressLink } from "@/components/shared/user-connection-avatar/UserAddressLink";
import { useConfigStore } from "@/state";
import { useAccount, useLogout, useSigner, useUser } from "@account-kit/react";
import { useQuery } from "@tanstack/react-query";

type UserConnectionDetailsProps = {
  deploymentStatus: boolean;
};
export function UserConnectionDetails({
  deploymentStatus,
}: UserConnectionDetailsProps) {
  const user = useUser();
  const signer = useSigner();
  const { logout } = useLogout();
  const { theme, primaryColor } = useConfigStore(
    ({ ui: { theme, primaryColor } }) => ({ theme, primaryColor })
  );
  const scaAccount = useAccount({ type: "LightAccount" });

  const isEOAUser = user?.type === "eoa";

  const getSignerAddress = async (): Promise<string | null> => {
    const signerAddress = await signer?.getAddress();
    return signerAddress ?? null;
  };

  const { data: signerAddress = "" } = useQuery({
    queryKey: ["signerAddress"],
    queryFn: getSignerAddress,
  });

  if (!user) return null;

  if (isEOAUser) {
    return (
      <div className="flex flex-col gap-2">
        {/* EOA Address */}
        <div className="flex flex-row justify-between">
          <span className="text-md md:text-sm text-fg-secondary">
            EOA Address
          </span>
          <UserAddressLink address={user?.address} />
        </div>

        {/* Logout */}
        <button
          className="flex flex-row justify-start items-center mt-[17px] hover:cursor-pointer active:opacity-70"
          onClick={() => {
            logout();
          }}
        >
          <span className="font-semibold text-md md:text-xs text-btn-primary">
            Logout
          </span>

          <div className="w-5 md:w-[14px] h-5 md:h-[14px] ml-2">
            <LogoutIcon stroke={primaryColor[theme]} />
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Smart Account */}
      <div className="flex flex-row justify-between">
        <span className="text-md md:text-sm text-fg-secondary">
          Smart account
        </span>
        <UserAddressLink address={scaAccount.address ?? ""} />
      </div>
      {/* Status */}
      <div className="flex flex-row justify-between items-center">
        <span className="text-md md:text-sm text-fg-secondary">Status</span>
        <div className="flex flex-row items-center">
          <DeploymentStatusIndicator
            isDeployed={!!deploymentStatus}
            className="w-[12px] h-[12px]"
          />
          <span className="text-fg-primary block ml-1 text-md md:text-sm">
            {deploymentStatus ? "Deployed" : "Not deployed"}
          </span>
        </div>
      </div>
      {/* Signer */}
      <div className="flex flex-row justify-between items-center mt-[17px]">
        <a
          target="_blank"
          href="https://accountkit.alchemy.com/concepts/smart-account-signer"
          className="flex justify-center items-center"
        >
          <span className="text-md md:text-sm text-fg-secondary mr-1">
            Signer
          </span>
          <div className="flex flex-row justify-center items-center w-[14px] h-[14px] ml-1">
            <ExternalLinkIcon className="stroke-fg-secondary" />
          </div>
        </a>

        <UserAddressLink address={signerAddress} />
      </div>

      {/* Logout */}

      <button
        className="flex flex-row justify-start items-center mt-[17px] hover:cursor-pointer active:opacity-70"
        onClick={() => {
          logout();
        }}
      >
        <span className="font-semibold text-md md:text-xs text-btn-primary">
          Logout
        </span>

        <div className="w-5 md:w-[14px] h-5 md:h-[14px] ml-2">
          <LogoutIcon stroke={primaryColor[theme]} />
        </div>
      </button>
    </div>
  );
}
