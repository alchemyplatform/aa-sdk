import { WalletTypes } from "@/app/config";
import { ExternalLinkIcon } from "@/components/icons/external-link";
import { LogoutIcon } from "@/components/icons/logout";
import { DeploymentStatusIndicator } from "@/components/user-connection-avatar/DeploymentStatusIndicator";
import { UserAddressTooltip } from "./UserAddressLink";
import { useConfigStore } from "@/state";
import { useAccount, useLogout, useSigner, useUser } from "@account-kit/react";
import { useQuery } from "@tanstack/react-query";
import { Hex } from "viem";
import { ODYSSEY_EXPLORER_URL } from "@/hooks/7702/constants";

type UserConnectionDetailsProps = {
  deploymentStatus: boolean;
  delegationAddress?: Hex;
};
export function UserConnectionDetails({
  deploymentStatus,
  delegationAddress,
}: UserConnectionDetailsProps) {
  const user = useUser();
  const signer = useSigner();
  const { logout } = useLogout();
  const { theme, primaryColor, walletType } = useConfigStore(
    ({ ui: { theme, primaryColor }, walletType }) => ({
      theme,
      primaryColor,
      walletType,
    })
  );
  const scaAccount = useAccount({
    type: "ModularAccountV2",
    accountParams: {
      mode: walletType === WalletTypes.smart ? "default" : "7702",
    },
    skipCreate: true,
  });

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
          {walletType === WalletTypes.smart ? "Smart account" : "Address"}
        </span>
        {/* TODO(jh): scaAccount.address might be good here for both when able to properly switch MAv2 mode? */}
        <UserAddressTooltip
          address={
            walletType === WalletTypes.smart
              ? scaAccount.address ?? ""
              : signerAddress ?? ""
          }
          linkEnabled
        />
      </div>

      {walletType === WalletTypes.smart ? (
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

            <UserAddressTooltip address={signerAddress} />
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
