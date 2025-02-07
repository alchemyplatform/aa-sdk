import { cn } from "@/lib/utils";
import { links } from "@/utils/links";

type MintCardActionButtonsProps = {
  nftTransfered: boolean;
  handleCollectNFT: () => void;
  disabled?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

// TODO(jh): delete this file
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
          className="akui-btn akui-btn-primary h-10 w-full p-2 radius mb-4 lg:mb-4"
          disabled={disabled}
          onClick={handleCollectNFT}
        >
          Collect NFT
        </button>
      ) : (
        <div>
          <a
            href={links.dashboard}
            className="akui-btn akui-btn-primary flex text-center h-10 mb-4 p-2 w-full  m-auto"
            target="_blank"
            rel="noreferrer"
          >
            Build with Account Kit
          </a>
        </div>
      )}
      <a
        href="https://accountkit.alchemy.com/react/quickstart"
        className="akui-btn-secondary akui-btn lg:bg-transparent lg:akui-btn-link md:w-auto h-10 font-semibold flex justify-center mb-6 lg:mb-0"
        target="_blank"
        rel="noreferrer"
      >
        View docs
      </a>
      <p className=" lg:hidden text-center text-sm text-fg-secondary">
        Visit desktop site to customize styles <br /> and auth methods
      </p>
    </div>
  );
}
