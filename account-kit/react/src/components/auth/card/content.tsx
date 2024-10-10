import type { ReactNode } from "react";

interface CardContentProps {
  header: ReactNode | string;
  icon?: ReactNode;
  description: ReactNode | string;
  error?: Error | string;
  className?: string;
  secondaryButton?: {
    title: string;
    onClick: () => void;
  };
}

// eslint-disable-next-line jsdoc/require-jsdoc
export const CardContent = ({
  header,
  icon,
  description,
  secondaryButton,
  className,
}: CardContentProps) => {
  return (
    <>
      <div className={`flex flex-col gap-5 items-center ${className}`}>
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
      </div>
      {secondaryButton && (
        <button
          className="btn btn-secondary w-full"
          onClick={secondaryButton.onClick}
        >
          {secondaryButton.title}
        </button>
      )}
    </>
  );
};
