import truncateAddress from "@/utils/truncate-address";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipArrow,
} from "@radix-ui/react-tooltip";
import { useState, useMemo } from "react";
import ExternalLink from "../shared/ExternalLink";
import { useChain } from "@account-kit/react";

export const UserAddressTooltip = ({
  address,
  linkEnabled,
}: {
  address: string | null;
  /** If link is enabled, clicking the address will open it using the chain's explorer URL. If disabled, clicking it will copy it to the clipboard. */
  linkEnabled?: boolean;
}) => {
  const [showCopied, setShowCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const truncatedAddress = truncateAddress(address ?? "");
  const { chain } = useChain();

  const handleClick = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setShowCopied(true);
    setIsOpen(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const explorerLink = useMemo(() => {
    const explorer = chain?.blockExplorers?.default;
    if (!address || !explorer) {
      return undefined;
    }
    return `${explorer.url}/address/${address}`;
  }, [address, chain]);

  return (
    <TooltipProvider>
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>
          {linkEnabled && explorerLink ? (
            <ExternalLink
              className="text-fg-primary underline text-md md:text-sm"
              href={explorerLink}
            >
              {truncatedAddress}
            </ExternalLink>
          ) : (
            <button
              onClick={handleClick}
              className="text-fg-primary underline text-md md:text-sm"
            >
              {truncatedAddress}
            </button>
          )}
        </TooltipTrigger>
        <TooltipContent
          align="start"
          alignOffset={-16}
          className="bg-foreground text-background px-3 py-2 rounded-md"
        >
          <TooltipArrow />
          <p className="text-xs">{showCopied ? "Copied!" : address}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
