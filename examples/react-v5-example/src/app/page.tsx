"use client";

import {
  useAccount,
  useChainId,
  useChains,
  useDisconnect,
  useSwitchChain,
} from "wagmi";
import { useSendEmailOtp, useSubmitOtpCode } from "@alchemy/react";

export default function Home() {
  const account = useAccount();
  const chainId = useChainId();
  const chains = useChains();
  const { switchChain } = useSwitchChain();
  const { sendEmailOtpAsync, isSuccess: sentEmailOtp } = useSendEmailOtp();
  const { submitOtpCodeAsync } = useSubmitOtpCode();
  const { disconnect } = useDisconnect();

  return (
    <div className="flex flex-col items-center justify-items-center min-h-screen p-12 gap-6">
      <p className="font-semibold">
        {account.isConnected ? "Connected" : "Not connected"}
      </p>
      {account.isConnected && (
        <div className="flex flex-col gap-4 items-center">
          <p>Chain ID: {chainId}</p>
          <div className="flex gap-3 flex-wrap">
            {chains.map((chain) => (
              <button
                key={chain.id}
                onClick={() => switchChain({ chainId: chain.id })}
                className="enabled:cursor-pointer disabled:cursor-not-allowed rounded bg-blue-500 px-4 py-2 font-bold text-white enabled:hover:bg-blue-700 text-sm disabled:opacity-50"
                disabled={chain.id === chainId}
              >
                Switch to {chain.name}
              </button>
            ))}
            <button
              onClick={() => disconnect()}
              className="cursor-pointer rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-700 text-sm"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
      {!account.isConnected && (
        <div className="flex gap-3">
          <button
            className="cursor-pointer rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
            onClick={async () => {
              const email = prompt("Enter your email:");
              if (!email) {
                return;
              }
              await sendEmailOtpAsync({ email });
            }}
          >
            {sentEmailOtp ? "Resend" : "Send"} OTP
          </button>
          {sentEmailOtp && (
            <button
              className="cursor-pointer rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
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
          )}
        </div>
      )}
      {/* TODO(jh): sign message */}
      {/* TODO(jh): sign typed data */}
      {/* TODO(jh): send transaction (using smart wallet client for now) */}
    </div>
  );
}
