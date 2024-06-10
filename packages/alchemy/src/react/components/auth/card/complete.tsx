import { useEffect } from "react";
import { SuccessIllustration } from "../../../icons/success.js";
import { PoweredBy } from "../../poweredby.js";
import type { AuthCardProps } from "./index.js";

// eslint-disable-next-line jsdoc/require-jsdoc
export const Complete = ({ onAuthSuccess }: AuthCardProps) => {
  useEffect(() => {
    setTimeout(() => {
      onAuthSuccess?.();
    }, 1_500);
  }, [onAuthSuccess]);

  return (
    <div className="flex flex-col gap-5 items-center">
      <div className="flex flex-col items-center justify-center h-12 w-12">
        <SuccessIllustration />
      </div>

      <h3 className="font-semibold text-lg">Login successful</h3>

      <PoweredBy />
    </div>
  );
};
