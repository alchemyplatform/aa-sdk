import { ExternalLinkIcon } from "@/components/icons/external-link";
import { cn } from "@/lib/utils";

type MintCardActionButtonsProps = {
  nftTransfered: boolean;
  handleCollectNFT: () => void;
  status: Record<string, string>;
  transactionUrl: string;
} & React.HTMLAttributes<HTMLDivElement>;

export function MintCardActionButtons({
  nftTransfered,
  handleCollectNFT,
  status,
  transactionUrl,
  className,
  ...props
}: MintCardActionButtonsProps) {
  return (
    <div {...props} className={cn("px-6 xl:px-0", className)}>
      {!nftTransfered ? (
        <button
          className="btn btn-primary w-full p-2 radius mb-6 xl:mb-4"
          disabled={Object.values(status).some((x) => x === "loading")}
          onClick={handleCollectNFT}
        >
          Collect NFT
        </button>
      ) : (
        <div>
          <a
            href={transactionUrl}
            target="_blank"
            rel="noreferrer"
            className="text-fg-secondary mb-6 flex justify-between items-center"
          >
            View transaction
            <div className="w-4 h-4">
              <ExternalLinkIcon className="text-fg-secondary" />
            </div>
          </a>
          <a
            href="https://dashboard.alchemy.com/"
            className="btn btn-primary flex text-center mb-4 p-2"
            target="_blank"
            rel="noreferrer"
          >
            Build with Account Kit
          </a>
        </div>
      )}
      <a
        href="https://accountkit.alchemy.com/react/quickstart"
        className=" btn-link text-sm font-semibold hidden md:flex justify-center"
        target="_blank"
        rel="noreferrer"
      >
        View docs
      </a>
      <p className="text-sm text-fg-secondary text-center md:hidden">
        Visit desktop site to customize styles and auth methods
      </p>
    </div>
  );
}
