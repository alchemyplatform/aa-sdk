import React from "react";

type TileProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  type?: "primary" | "secondary";
};

function Tile({ title, description, icon, type = "primary" }: TileProps) {
  return (
    <div
      className={`flex flex-col grow ${
        type === "primary" ? "p-8 pt-10" : "p-6"
      }  border border-[#E2E8F0] rounded-lg`}
    >
      <div className="flex flex-col gap-4">
        {icon}
        <div className="flex flex-row gap-4">
          <div className="flex flex-col grow gap-1">
            <span
              className={`text-[${
                type === "primary" ? "24px" : "20px"
              }] font-semibold`}
            >
              {title}
            </span>
            <span className="text-[16px] text-gray-600">{description}</span>
          </div>
          <div className="self-end">
            <img
              src={"/images/next-arrow.png"}
              alt="clickable arrow taking you to next part of the site"
              width={14}
              height={12}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Icon({
  src,
  alt,
  size = "lg",
}: {
  src: string;
  alt: string;
  size?: "lg" | "sm";
}) {
  const iconSize = size === "lg" ? 40 : 32;
  return <img src={src} alt={alt} height={iconSize} width={iconSize} />;
}

export function HomePage() {
  return (
    <>
      <style>{`
        #vocs-content, .vocs_Content {
            min-width: -webkit-fill-available;
            padding-right: var(--vocs-topNav_horizontalPadding);
        }
      `}</style>
      <div className="flex grow flex-col gap-6">
        <img
          src="/images/account-kit-overview-banner.png"
          alt="Banner for account kit saying welcome to account kit"
        />
        <div className="flex flex-col gap-10">
          <span className="text-[28px] font-semibold">
            Discover our solutions
          </span>
          <div className="flex flex-col gap-4">
            <span className="text-[20px] font-semibold">Main solutions</span>
            <div className="flex flex-row gap-4">
              <Tile
                title="React library"
                description="Main body text with brief summary"
                icon={<Icon src="/images/react-logo.png" alt="React logo" />}
              />
              <Tile
                title="Core library"
                description="Main body text with brief summary"
                icon={<Icon src="/images/react-logo.png" alt="React logo" />}
              />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-[20px] font-semibold">
              Additional solutions
            </span>
            <div className="flex flex-row gap-4">
              <Tile
                title="Infra library"
                description="Main body text with brief summary"
                icon={
                  <Icon
                    src="/images/react-logo.png"
                    alt="React logo"
                    size="sm"
                  />
                }
                type="secondary"
              />
              <Tile
                title="Signer library"
                description="Main body text with brief summary"
                icon={
                  <Icon
                    src="/images/react-logo.png"
                    alt="React logo"
                    size="sm"
                  />
                }
                type="secondary"
              />
              <Tile
                title="Smart contracts"
                description="Main body text with brief summary"
                icon={
                  <Icon
                    src="/images/react-logo.png"
                    alt="React logo"
                    size="sm"
                  />
                }
                type="secondary"
              />
              <Tile
                title="AA-SDK"
                description="Main body text with brief summary"
                icon={
                  <Icon
                    src="/images/react-logo.png"
                    alt="React logo"
                    size="sm"
                  />
                }
                type="secondary"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
