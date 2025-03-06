import { ThreeStarsIcon } from "@/components/icons/three-stars";
import { OTPInput, OTPCodeType } from "@/components/ui/OTPInput";
import { Spinner } from "@/components/ui/Spinner";
import { Dispatch, SetStateAction } from "react";
export function MFAModalVerify({
  otp,
  setOTP,
  setError,
  error,
  isLoading,
}: {
  otp: OTPCodeType;
  setOTP: (otp: OTPCodeType) => void;
  setError: Dispatch<SetStateAction<string | null>>;
  error: string | null;
  isLoading: boolean;
}) {
  return (
    <>
      <div className="flex justify-center mb-5 relative">
        <ThreeStarsIcon
          isBranded={true}
          className="h-8 w-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        />
        <Spinner className="h-12 w-12" />
      </div>
      <h2 className="text-lg font-semibold mb-5 text-fg-primary">
        Enter authenticator app code
      </h2>
      <div className="flex gap-2 mb-5">
        <OTPInput
          value={otp}
          setValue={setOTP}
          setErrorText={setError}
          errorText={error}
          handleReset={() => {}}
          disabled={isLoading}
        />
      </div>
    </>
  );
}
