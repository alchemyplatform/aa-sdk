import Image from "next/image";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { ArrowUpRightFromSquare } from "lucide-react";
import { LoadingIcon } from "../icons/loading";

export const DepositAndSwapsCard = () => {
    const uri = "https://alchemyapi.typeform.com/to/pkjSr57v"

  const imageSlot = (
    <div className="w-full h-full bg-[#8797D5] flex justify-center items-center relative">
      {uri ? (
        <Image
          src="/images/deposits.png"
          alt="Physical coins of ethereum and bitcoin being swapped"
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
        heading="Swaps, Deposits, Payments"
        content={
            <p className="text-fg-primary text-sm mb-3">
                Maximize liquidity onchain with easy to use swaps, payments, and deposits.
            </p>
        }
        buttons={
            <Button
                as="a"
                className="mt-auto w-full"
                href={uri}
                target="_blank"
            >
                Request Early Access
                <ArrowUpRightFromSquare className="w-4 h-4 mr-2" />
          </Button>
        }
      />
    </>
  );
};
