import Image from "next/image";
import { Card } from "./Card";
import { Button } from "./Button";
import { ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Erc20Modal } from "../modals/Erc20";
import { AccountMode } from "@/app/config";

export const Erc20SponsorshipCard = ({
  accountMode,
}: {
  accountMode: AccountMode;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasMintedNft, setHasMintedNft] = useState(false);

  const handleNftMinted = () => {
    setHasMintedNft(true);
  };

  const uri = "/images/paper-airplane.svg";

  const content = (
    <>
      <p className="text-fg-primary text-sm mb-3">
        Checkout with one click and a single token.
      </p>
      <div className="flex justify-between items-center">
        <p className="text-fg-secondary text-base">Price</p>
        <p className="text-base text-fg-primary">1 USDC</p>
      </div>
    </>
  );

  return (
    <>
      <Card
        imageSlot={
          <div className="w-full h-full bg-[#8797D5] flex justify-center items-center relative">
            <Image
              src={uri}
              alt="Cute character with hat"
              width={300}
              height={300}
              className="w-full h-full object-cover object-[0_40%]"
              priority
            />
          </div>
        }
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
