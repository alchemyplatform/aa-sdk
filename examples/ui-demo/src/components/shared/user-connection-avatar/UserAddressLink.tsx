import truncateAddress from "@/utils/truncate-address";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipArrow,
} from "@radix-ui/react-tooltip";
import { useState } from "react";

export const UserAddressLink = ({ address }: { address: string | null }) => {
  const [showCopied, setShowCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const truncatedAddress = truncateAddress(address ?? "");

  const handleClick = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setShowCopied(true);
    setIsOpen(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  return (
    <TooltipProvider>
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>
          <button
            onClick={handleClick}
            className="text-fg-primary underline text-md md:text-sm"
          >
            {truncatedAddress}
          </button>
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
