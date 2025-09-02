import Image from "next/image";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { ArrowUpRightFromSquare } from "lucide-react";

export const DepositAndSwapsCard = () => {
  const uri = "https://alchemyapi.typeform.com/to/pkjSr57v";

  return (
    <Card
      imageSlot={
        <div className="w-full h-full bg-[#8797D5] flex justify-center items-center relative">
          <Image
            src="/images/deposits-swaps.svg"
            alt="Physical coins of ethereum and bitcoin being swapped"
            width={300}
            height={300}
            className="w-full h-full object-cover object-[0_40%]"
            priority
          />
        </div>
      }
      heading="Swaps, Deposits, Payments"
      content={
        <p className="text-fg-primary text-sm mb-3">
          Maximize liquidity onchain with easy to use swaps, payments, and
          deposits.
        </p>
      }
      buttons={
        <Button asChild className="mt-auto w-full">
          <a href={uri} target="_blank" rel="noopener noreferrer">
            Request Early Access
            <ArrowUpRightFromSquare className="w-4 h-4 mr-2" />
          </a>
        </Button>
      }
    />
  );
};
