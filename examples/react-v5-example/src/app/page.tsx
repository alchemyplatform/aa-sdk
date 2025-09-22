"use client";

import { useAccount } from "wagmi";
import { useSendEmailOtp, useSubmitOtpCode } from "@alchemy/react";

export default function Home() {
  const account = useAccount();
  const { sendEmailOtp } = useSendEmailOtp();
  const { submitOtpCode } = useSubmitOtpCode();

  return (
    <div className="flex flex-col items-center justify-items-center min-h-screen p-12">
      {account.isConnected ? "Connected" : "Not connected"}
      <button
        onClick={() => {
          const email = prompt("Enter your email:");
          if (!email) {
            return;
          }
          sendEmailOtp({ email });
        }}
      >
        Send OTP
      </button>
      <button
        onClick={() => {
          const otpCode = prompt("Enter the OTP code:");
          if (!otpCode) {
            return;
          }
          submitOtpCode({ otpCode });
        }}
      >
        Enter OTP
      </button>
    </div>
  );
}
