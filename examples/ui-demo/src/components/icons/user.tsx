import { useTheme } from "@/state/useTheme";
import { SVGProps } from "react";

export const UserIcon = ({
  fill = "currentColor",
  ...props
}: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => {
  const theme = useTheme();
  const isDark = theme === "dark";

  return (
    <svg
      width="24"
      height="25"
      viewBox="0 0 24 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M5.3999 19.6999C5.86107 19.1834 8.02095 16.8066 8.65391 16.8066H15.3463C16.2635 16.8066 18.1359 18.7768 18.5999 19.4713M21.5999 12.4999C21.5999 17.8018 17.3018 22.0999 11.9999 22.0999C6.69797 22.0999 2.3999 17.8018 2.3999 12.4999C2.3999 7.19797 6.69797 2.8999 11.9999 2.8999C17.3018 2.8999 21.5999 7.19797 21.5999 12.4999ZM15.4387 9.22786C15.4387 7.39635 13.8926 5.8999 12.0002 5.8999C10.1078 5.8999 8.56164 7.39635 8.56164 9.22786C8.56164 11.0594 10.1078 12.5558 12.0002 12.5558C13.8926 12.5558 15.4387 11.0594 15.4387 9.22786Z"
        stroke={isDark ? "#e2e8f0" : "#475569"}
        strokeWidth="2"
      />
    </svg>
  );
};
