import type { ReactNode } from "react";
import { PoweredBy } from "../../poweredby.js";

interface CardContentProps {
  header: ReactNode | string;
  icon?: ReactNode;
  description: ReactNode | string;
  support?: {
    text: string;
    cta: ReactNode;
  };
  error?: Error | string;
}

// eslint-disable-next-line jsdoc/require-jsdoc
export const CardContent = ({
  header,
  icon,
  description,
  support,
}: CardContentProps) => {
  return (
    <div className="flex flex-col gap-5 items-center">
      {icon && (
        <div className="flex flex-col items-center justify-center w-[56px] h-[56px]">
          {icon}
        </div>
      )}
      <span className="text-lg text-fg-primary font-semibold">{header}</span>
      {typeof description === "string" ? (
        <p className="text-fg-secondary text-center font-normal text-sm">
          {description}
        </p>
      ) : (
        description
      )}
      {support && (
        <div className="flex flex-row gap-2 text-xs font-normal">
          <span className="text-fg-secondary">{support.text}</span>
          {support.cta}
        </div>
      )}
      <PoweredBy />
    </div>
  );
};
