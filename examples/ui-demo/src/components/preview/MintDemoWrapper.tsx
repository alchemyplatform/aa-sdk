import Image from "next/image";
import { CheckIcon } from "../icons/check";
import { GasIcon } from "../icons/gas";
import { DrawIcon } from "../icons/draw";
import { ReceiptIcon } from "../icons/receipt";

export function MintDemoWrapper() {
  return (
    <div>
      <div>
        {
          // Iyk
        }
      </div>
      <div className="flex bg-bg-surface-default radius-1 border-btn-secondary overflow-hidden">
        <div className="p-12">
          <h2 className="text-2xl font-semibold tracking-tight leading-10 mb-8 text-primary">
            One-click checkout
          </h2>
          <ValueProp
            title="Invisible signing"
            icon="signing"
            description="Sign actions in the background with embedded wallets"
          />

          <ValueProp
            title="Gas sponsorship"
            icon="gas"
            description={
              <span>
                Sponsor gas fees to remove barriers to adoption.{" "}
                <a>Learn how.</a>
              </span>
            }
          />
          <ValueProp
            title="Batch transactions"
            icon="batch"
            description="Deploy the user's smart account in their first transaction"
          />
        </div>
        <div className="p-12 bg-[#ECF3FF]">
          <h3 className="text-secondary text-base font-semibold mb-4">
            NFT Summary
          </h3>
          <Image
            width="277"
            height="255"
            src="/images/NFT.png"
            alt="An NFT"
            className="mb-4"
          />
          <div className="flex justify-between mb-6">
            <p className="text-secondary text-xs">Gas Fee</p>
            <div>
              <span className="line-through mr-1 text-sm">$0.02</span>
              <span
                className="text-sm"
                style={{
                  background:
                    "linear-gradient(126deg, #36BEFF 4.59%, #733FF1 108.32%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Free
              </span>
            </div>
          </div>
          <button className="btn-primary w-full p-2 radius">Collect NFT</button>
        </div>
      </div>
    </div>
  );
}

const ValueProp = ({
  icon,
  title,
  description,
}: {
  icon: "signing" | "gas" | "batch" | "loading" | "success";
  title: string;
  description: string | JSX.Element;
}) => {
  return (
    <div className="flex gap-3 mb-8">
      {getMintIcon(icon)}
      <div className=" max-w-[308px]">
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="text-base leading-6 text-secondary">{description}</p>
      </div>
    </div>
  );
};

const getMintIcon = (
  icon: "signing" | "gas" | "batch" | "loading" | "success"
) => {
  switch (icon) {
    case "signing":
      // TODO: investigate why stroke is making the svg look bold.
      return <DrawIcon className="stroke-fg-secondary" />;
    case "gas":
      return <GasIcon className="stroke-fg-secondary" />;
    case "batch":
      return <ReceiptIcon className="stroke-fg-secondary" />;
    case "loading":
      return "loading.png";
    case "success":
      return <CheckIcon stroke="#16A34A" />;
  }
};
