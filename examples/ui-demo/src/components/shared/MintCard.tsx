import Image from "next/image";
import { CheckIcon } from "../icons/check";
import { GasIcon } from "../icons/gas";
import { DrawIcon } from "../icons/draw";
import { ReceiptIcon } from "../icons/receipt";
import React, { useCallback } from "react";

export const MintCard = () => {
  const getPrimaryColor = useCallback(() => {
    const color = getComputedStyle(document.documentElement)
      .getPropertyValue("--akui-fg-accent-brand")
      .trim();
    const rgba = hexToRGBA(color, 0.1);
    return rgba;
  }, []);
  console.log(getPrimaryColor());
  return (
    <div className="flex bg-bg-surface-default radius-1 border-btn-secondary overflow-hidden">
      <div className="p-12">
        <h2 className="text-2xl font-semibold tracking-tight leading-10 mb-8 text-fg-primary">
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
              Sponsor gas fees to remove barriers to adoption. <a>Learn how.</a>
            </span>
          }
        />
        <ValueProp
          title="Batch transactions"
          icon="batch"
          description="Deploy the user's smart account in their first transaction"
        />
      </div>
      <div className={`p-12`} style={{ background: getPrimaryColor() }}>
        <h3 className="text-fg-secondary text-base font-semibold mb-4">
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
          <p className="text-fg-secondary text-sm">Gas Fee</p>
          <p>
            <span className="line-through mr-1 text-sm text-fg-primary align-top">
              $0.02
            </span>
            <span
              className="text-sm align-top"
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
          </p>
        </div>
        <button className="btn-primary w-full p-2 radius">Collect NFT</button>
      </div>
    </div>
  );
};

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
        <h3 className="text-base font-semibold text-fg-secondary">{title}</h3>
        <p className="text-base leading-6 text-fg-secondary">{description}</p>
      </div>
    </div>
  );
};

const getMintIcon = (
  icon: "signing" | "gas" | "batch" | "loading" | "success"
) => {
  switch (icon) {
    case "signing":
      return <DrawIcon className="text-fg-secondary" />;
    case "gas":
      return <GasIcon className="text-fg-secondary" />;
    case "batch":
      return <ReceiptIcon className="text-fg-secondary" />;
    case "loading":
      return "loading.png";
    case "success":
      return <CheckIcon stroke="#16A34A" />;
  }
};
export function hexToRGBA(hex: string, alpha: number): string {
  // Remove the leading '#' if present
  hex = hex.replace(/^#/, "");

  // Validate hex string
  if (!/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(hex)) {
    throw new Error("Invalid hex color format");
  }

  let r: number, g: number, b: number;

  if (hex.length === 3) {
    // Expand shorthand form (#RGB to #RRGGBB)
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 6) {
    // Parse the RRGGBB format
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else {
    throw new Error("Invalid hex color length");
  }

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
