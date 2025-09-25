import { useOnramp } from "@account-kit/react";
import { Button } from "./Button";
import { Card } from "./Card";
import Image from "next/image";

export const FundingCard = () => {
  const { onramp, isLoading } = useOnramp();

  const handleOpenFunding = async () => {
    await onramp("USDC", "ethereum");
  };

  return (
    <Card
      imageSlot={
        <Image
          src="/images/piggy-bank.svg"
          alt="Buy crypto with fiat"
          width={300}
          height={300}
          className="w-full h-full object-cover"
          priority
        />
      }
      heading="Buy Crypto"
      content={
        <p className="text-fg-primary text-sm">
          Fund your wallet with USDC using debit card or bank transfer
        </p>
      }
      buttons={
        <Button
          variant="primary"
          onClick={handleOpenFunding}
          className="w-full mt-auto"
          disabled={isLoading}
        >
          Buy USDC
        </Button>
      }
    />
  );
};
