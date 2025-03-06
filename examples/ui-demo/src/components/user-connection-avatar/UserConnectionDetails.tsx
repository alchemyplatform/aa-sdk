import { ExternalLinkIcon } from "@/components/icons/external-link";
import { LogoutIcon } from "@/components/icons/logout";
import { DeploymentStatusIndicator } from "@/components/user-connection-avatar/DeploymentStatusIndicator";
import { UserAddressTooltip } from "./UserAddressLink";
import { useConfigStore } from "@/state";
import { useAccount, useLogout, useUser } from "@account-kit/react";
import { Hex } from "viem";
import { ODYSSEY_EXPLORER_URL } from "@/hooks/7702/constants";
import { useSignerAddress } from "@/hooks/useSignerAddress";

type UserConnectionDetailsProps = {
  deploymentStatus: boolean;
  delegationAddress?: Hex;
};
export function UserConnectionDetails({
  deploymentStatus,
  delegationAddress,
}: UserConnectionDetailsProps) {
  const user = useUser();
  const signerAddress = useSignerAddress();
  const { logout } = useLogout();
  const { theme, primaryColor, accountMode } = useConfigStore(
    ({ ui: { theme, primaryColor }, accountMode }) => ({
      theme,
      primaryColor,
      accountMode,
    })
  );
  const scaAccount = useAccount({
    type: "ModularAccountV2",
    accountParams: {
      mode: accountMode,
    },
  });

  const isEOAUser = user?.type === "eoa";

  if (!user) return null;

  if (isEOAUser) {
    return (
      <div className="flex flex-col gap-2">
        {/* EOA Address */}
        <div className="flex flex-row justify-between">
          <span className="text-md md:text-sm text-fg-secondary">
            EOA Address
          </span>
          <UserAddressTooltip address={user?.address} linkEnabled />
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
          {accountMode === "default" ? "Smart account" : "Address"}
        </span>
        <UserAddressTooltip address={scaAccount.address ?? ""} linkEnabled />
      </div>

      {accountMode === "default" ? (
        <>
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

            <UserAddressTooltip address={signerAddress ?? null} />
          </div>
        </>
      ) : (
        <div className="flex flex-row justify-between items-center">
          <span className="text-md md:text-sm text-fg-secondary">
            Delegated to
          </span>
          <div className="flex flex-row items-center">
            <DeploymentStatusIndicator
              isDeployed={deploymentStatus}
              className="w-[12px] h-[12px]"
            />
            <span className="text-fg-primary block ml-1 text-md md:text-sm">
              {deploymentStatus && delegationAddress ? (
                <a
                  href={`${ODYSSEY_EXPLORER_URL}/address/0x${delegationAddress.slice(
                    8
                  )}`}
                  target="_blank"
                  className="underline"
                >
                  Modular Account
                </a>
              ) : (
                "None"
              )}
            </span>
          </div>
        </div>
      )}

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
