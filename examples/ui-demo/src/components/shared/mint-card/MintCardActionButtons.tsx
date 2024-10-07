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
          className="btn btn-primary w-full p-2 radius mb-4 xl:mb-4"
          disabled={Object.values(status).some((x) => x === "loading")}
          onClick={handleCollectNFT}
        >
          Collect NFT
        </button>
      ) : (
        <div>
          <a
            href="https://dashboard.alchemy.com/"
            className="btn btn-primary flex text-center mb-4 p-2 w-52 m-auto"
            target="_blank"
            rel="noreferrer"
          >
            Build with Account Kit
          </a>
        </div>
      )}
      <a
        href="https://accountkit.alchemy.com/react/quickstart"
        className="btn-secondary btn md:bg-transparent md:btn-link md:w-auto  text-sm font-semibold flex justify-center mb-6 md:mb-0"
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
