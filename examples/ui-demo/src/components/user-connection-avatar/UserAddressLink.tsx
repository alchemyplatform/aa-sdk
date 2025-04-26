import truncateAddress from "@/utils/truncate-address";
import { useChain } from "@account-kit/react";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import { useMemo, useState } from "react";
import ExternalLink from "../shared/ExternalLink";

export const UserAddressTooltip = ({
  address,
  linkEnabled,
  href,
}: {
  address: string | null;
  /** If link is enabled, clicking the address will open it using the chain's explorer URL. If disabled, clicking it will copy it to the clipboard. */
  linkEnabled?: boolean;
  href?: string;
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
    if (href) return href;

    const explorer = chain?.blockExplorers?.default;
    if (!address || !explorer) {
      return undefined;
    }
    return `${explorer.url}/address/${address}`;
  }, [address, chain, href]);

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
