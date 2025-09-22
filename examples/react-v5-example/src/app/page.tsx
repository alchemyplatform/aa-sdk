"use client";

import { useAccount, useConnectors } from "wagmi";
import { useSendEmailOtp, useSubmitOtpCode } from "@alchemy/react";

export default function Home() {
  const account = useAccount();
  const connectors = useConnectors();
  // TODO(jh): these hooks are failing to find the query provider.
  // continue debugging, see here: https://github.com/TanStack/query/issues/3595
  const { sendEmailOtpAsync } = useSendEmailOtp();
  const { submitOtpCodeAsync } = useSubmitOtpCode();

  return (
    <div className="flex flex-col items-center justify-items-center min-h-screen p-12">
      {account.isConnected ? "Connected" : "Not connected"}
      <button
        onClick={async () => {
          const email = prompt("Enter your email:");
          if (!email) {
            return;
          }
          await sendEmailOtpAsync({ email });
        }}
      >
        Send OTP
      </button>
      <button
        onClick={async () => {
          const otpCode = prompt("Enter the OTP code:");
          if (!otpCode) {
            return;
          }
          await submitOtpCodeAsync({ otpCode });
        }}
      >
        Enter OTP
      </button>
    </div>
  );
}
