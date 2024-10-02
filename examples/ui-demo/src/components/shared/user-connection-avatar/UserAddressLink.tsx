import truncateAddress from "@/utils/truncate-address";
import { useConnection } from "@account-kit/react";
import { useMemo } from "react";

export const UserAddressLink = ({ address }: { address: string | null }) => {
  const connection = useConnection();
  const truncatedAddress = truncateAddress(address ?? "");
  const addressBlockExplorerUrl = useMemo(() => {
    if (!address || !connection.chain.blockExplorers) {
      return null;
    }

    return `${connection.chain.blockExplorers?.default.url}/address/${address}`;
  }, [address, connection]);

  return (
    <a
      target="_blank"
      className="text-fg-primary underline text-md md:text-sm"
      href={addressBlockExplorerUrl ?? "#"}
    >
      {truncatedAddress}
    </a>
  );
};
