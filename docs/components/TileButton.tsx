import { ReactNode } from "react";

type TileButtonProps = {
  icon: ReactNode;
  title: string;
  description: string;
  href: string;
  target?: string;
};

export const TileButton = ({
  icon,
  title,
  description,
  href,
  target,
}: TileButtonProps) => {
  return (
    <a href={href} target={target}>
      <div className="flex flex-col gap-2 border border-gray-200 rounded-lg p-6 cursor-pointer">
        {icon}
        <div className="font-medium text-lg">{title}</div>
        <div className="text-md">{description}</div>
      </div>
    </a>
  );
};

type SmallTileProps = {
  icon: ReactNode;
  title: string;
  description: string;
  href: string;
};

export const SmallTileRow = ({
  icon,
  title,
  description,
  href,
}: SmallTileProps) => {
  return (
    <a href={href}>
      <div className="flex flex-row gap-3 flex-1 content-center items-center cursor-pointer">
        <div className="flex items-center justify-center rounded-lg border border-gray-200 w-[48px] h-[48px] flex-0">
          {icon}
        </div>
        <div className="flex flex-col">
          <div className="font-medium text-md">{title}</div>
          <div className="text-md">{description}</div>
        </div>
      </div>
    </a>
  );
};
