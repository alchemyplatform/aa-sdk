import Image from "next/image";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Erc20Modal } from "../modals/Erc20";
import { AccountMode } from "@/app/config";
import { DEMO_NFT_USDC_MINTABLE_ADDRESS } from "@/utils/constants";
import { useReadNFTUri } from "@/hooks/useReadNFTUri";
import { alchemy, arbitrumSepolia, baseSepolia } from "@account-kit/infra";
import { LoadingIcon } from "../icons/loading";

export const Erc20SponsorshipCard = ({
  accountMode,
}: {
  accountMode: AccountMode;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasMintedNft, setHasMintedNft] = useState(false);
  const chain = accountMode === "7702" ? baseSepolia : arbitrumSepolia;
  const transport = alchemy({
    rpcUrl: accountMode === "7702" ? "/api/rpc-base-sepolia" : "/api/rpc",
  });

  const { uri } = useReadNFTUri({
    contractAddress: DEMO_NFT_USDC_MINTABLE_ADDRESS,
    clientOptions: { mode: accountMode, chain, transport },
  });

  const handleNftMinted = () => {
    setHasMintedNft(true);
  };

  const imageSlot = (
    <div className="w-full h-full bg-[#8797D5] flex justify-center items-center relative">
      {uri ? (
        <Image
          src={uri}
          alt="Cute character with hat"
          width={300}
          height={300}
          className="w-full h-full object-cover object-[0_40%]"
          priority
        />
      ) : (
        <LoadingIcon />
      )}
    </div>
  );

  const content = (
    <>
      <p className="text-fg-primary text-sm mb-3">
        Checkout with one click and a single token.
      </p>
      <div className="flex justify-between items-center">
        <p className="text-fg-secondary text-base">Cost</p>
        <p className="text-base text-fg-primary">1 USDC</p>
      </div>
    </>
  );

  return (
    <>
      <Card
        badgeSlot={
          <Badge
            text="New!"
            className="text-white"
            style={{
              background: "linear-gradient(132deg, #FF9C27 0%, #FD48CE 100%)",
            }}
          />
        }
        imageSlot={imageSlot}
        heading="Pay gas with any token"
        content={content}
        buttons={
          <Button
            className="mt-auto w-full"
            onClick={() => setIsModalOpen(true)}
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            {hasMintedNft ? "Buy NFT again" : "Buy NFT"}
          </Button>
        }
      />
      <Erc20Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        accountMode={accountMode}
        imageUri={uri}
        onNftMinted={handleNftMinted}
      />
    </>
  );
};
