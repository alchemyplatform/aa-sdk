import { cn } from "@/lib/utils";
import { links } from "@/utils/links";

type MintCardActionButtonsProps = {
  nftTransfered: boolean;
  handleCollectNFT: () => void;
  disabled?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

export function MintCardActionButtons({
  nftTransfered,
  handleCollectNFT,
  className,
  disabled,
  ...props
}: MintCardActionButtonsProps) {
  return (
    <div {...props} className={cn(className)}>
      {!nftTransfered ? (
        <button
          className="btn btn-primary h-10 w-full p-2 radius mb-4 xl:mb-4"
          disabled={disabled}
          onClick={handleCollectNFT}
        >
          Collect NFT
        </button>
      ) : (
        <div>
          <a
            href={links.dashboard}
            className="btn btn-primary flex text-center h-10 mb-4 p-2 w-full  m-auto"
            target="_blank"
            rel="noreferrer"
          >
            Build with Account Kit
          </a>
        </div>
      )}
      <a
        href="https://accountkit.alchemy.com/react/quickstart"
        className="btn-secondary btn xl:bg-transparent xl:btn-link md:w-auto h-10 font-semibold flex justify-center mb-6 xl:mb-0"
        target="_blank"
        rel="noreferrer"
      >
        View docs
      </a>
    </div>
  );
}
