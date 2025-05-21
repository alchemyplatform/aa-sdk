import React from "react";
import { cn } from "@/lib/utils";
import { LoadingIcon } from "../icons/loading";

export type ModalCTAButtonProps = {
  onClick?: () => void;
  variant?: "primary" | "secondary";
  isLoading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
};

export const ModalCTAButton: React.FC<ModalCTAButtonProps> = ({
  onClick,
  variant = "primary",
  isLoading = false,
  loadingText = "Loading...",
  icon,
  children,
  disabled = false,
  className,
}) => {
  const isEffectivelyDisabled = disabled || isLoading;

  const buttonClassName = cn(
    "flex h-[38px] py-2 px-2.5 justify-center items-center gap-1.5 self-stretch rounded-md w-full transition-all duration-300 font-medium",
    {
      // Disabled styles (take precedence)
      "border border-[#E2E8F0] bg-[#EFF4F9] text-[#CBD5E1] cursor-not-allowed":
        isEffectivelyDisabled,
      // Variant styles (apply only if not disabled)
      "bg-[#363FF9] text-white cursor-pointer hover:bg-indigo-700":
        !isEffectivelyDisabled && variant === "primary",
      "bg-white border border-[#E2E8F0] text-secondary cursor-pointer hover:bg-gray-50":
        !isEffectivelyDisabled && variant === "secondary",
    },
    className
  );

  return (
    <button
      type="button"
      className={buttonClassName}
      onClick={onClick}
      disabled={isEffectivelyDisabled}
    >
      {isLoading && <LoadingIcon className="w-4 h-4" />}
      {!isLoading && icon}
      <span className="font-medium">{isLoading ? loadingText : children}</span>
    </button>
  );
};
