"use client";

import {
  useAccount,
  useChainId,
  useDisconnect,
  useSignMessage,
  useSignTypedData,
  useSwitchChain,
  useVerifyMessage,
  useVerifyTypedData,
} from "wagmi";
import { useSendCalls } from "wagmi/experimental"; // TODO(jh): why is this still experimental? do we have old wagmi version?
import {
  useSendEmailOtp,
  useSendSmsOtp,
  useLookupUserByPhone,
  useSubmitOtpCode,
} from "@alchemy/react";
import { zeroAddress } from "viem";
import { useState } from "react";

export default function Home() {
  const account = useAccount();
  const [authMode, setAuthMode] = useState<"email" | "sms">("email");

  return (
    <div className="flex flex-col items-center justify-items-center min-h-screen p-12 gap-6">
      <p className="font-semibold">
        {account.isConnected ? "Connected" : "Not connected"}
      </p>
      {!account.isConnected ? (
        <div className="flex flex-col gap-4 items-center">
          <div className="flex gap-3">
            <button
              onClick={() => setAuthMode("email")}
              className={`cursor-pointer rounded px-4 py-2 font-bold text-white text-sm ${
                authMode === "email"
                  ? "bg-blue-700"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              Email
            </button>
            <button
              onClick={() => setAuthMode("sms")}
              className={`cursor-pointer rounded px-4 py-2 font-bold text-white text-sm ${
                authMode === "sms"
                  ? "bg-blue-700"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              SMS
            </button>
          </div>
          {authMode === "email" ? <EmailAuthDemo /> : <SmsAuthDemo />}
        </div>
      ) : (
        <>
          <ChainControls />
          <SigningDemo />
          <SendCallsDemo />
        </>
      )}
    </div>
  );
}

const ChainControls = () => {
  const account = useAccount();
  const chainId = useChainId();
  const { chains, switchChainAsync } = useSwitchChain();
  const { disconnect } = useDisconnect();

  return (
    <div className="flex flex-col gap-4 items-center">
      <p>Address: {account.address}</p>
      <p>Chain ID: {chainId}</p>
      <div className="flex gap-3 flex-wrap">
        {chains.map((chain) => (
          <button
            key={chain.id}
            onClick={async () => await switchChainAsync({ chainId: chain.id })}
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
  );
};

const EmailAuthDemo = () => {
  const { sendEmailOtpAsync, isSuccess: sentEmailOtp } = useSendEmailOtp();
  const { submitOtpCodeAsync } = useSubmitOtpCode();

  return (
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
  );
};

const SmsAuthDemo = () => {
  const { sendSmsOtpAsync, isSuccess: sentSmsOtp } = useSendSmsOtp();
  const { lookupUserByPhoneAsync } = useLookupUserByPhone();
  const { submitOtpCodeAsync } = useSubmitOtpCode();

  return (
    <div className="flex flex-col gap-3 items-center">
      <div className="flex gap-3">
        <button
          className="cursor-pointer rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-700"
          onClick={async () => {
            const phoneNumber = prompt(
              "Enter your phone number (E.164 format, e.g., +12025551234):",
            );
            if (!phoneNumber) {
              return;
            }
            // Optional: lookup if phone is registered
            try {
              const result = await lookupUserByPhoneAsync({ phoneNumber });
              if (result) {
                console.log(`Phone registered with org: ${result.orgId}`);
              } else {
                console.log("Phone not registered - will create new account");
              }
            } catch (error) {
              console.error("Lookup failed:", error);
            }
            // Send OTP
            await sendSmsOtpAsync({ phoneNumber });
          }}
        >
          {sentSmsOtp ? "Resend" : "Send"} SMS OTP
        </button>
        {sentSmsOtp && (
          <button
            className="cursor-pointer rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-700"
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
      <p className="text-xs text-gray-500 max-w-md text-center">
        Phone number must include country code (e.g., +12025551234)
      </p>
    </div>
  );
};

const SigningDemo = () => {
  const account = useAccount();

  const {
    signMessageAsync,
    variables: signMessageVariables,
    data: messageSignature,
  } = useSignMessage();

  const { data: isMessageVerified } = useVerifyMessage({
    address: account.address,
    message: signMessageVariables?.message,
    signature: messageSignature,
  });

  const {
    signTypedDataAsync,
    variables: signTypedDataVariables,
    data: typedDataSignature,
  } = useSignTypedData();

  const { data: isTypedDataVerified } = useVerifyTypedData({
    ...signTypedDataVariables,
    address: account.address,
    signature: typedDataSignature,
  });

  const handleSignMessage = async () => {
    const message = prompt("Enter message to sign:");
    if (!message) {
      return;
    }

    try {
      const signature = await signMessageAsync({ message });
      alert(`Signature: ${signature}`);
    } catch (error) {
      console.error(error);
      alert("Failed to sign message");
    }
  };

  const handleSignTypedData = async () => {
    const typedData = {
      domain: {
        name: "Ether Mail",
        version: "1",
        chainId: account.chainId,
        verifyingContract:
          "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC" as const,
      },
      types: {
        Person: [
          { name: "name", type: "string" },
          { name: "wallet", type: "address" },
        ],
        Mail: [
          { name: "from", type: "Person" },
          { name: "to", type: "Person" },
          { name: "contents", type: "string" },
        ],
      },
      primaryType: "Mail" as const,
      message: {
        from: {
          name: "Cow",
          wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
        },
        to: {
          name: "Bob",
          wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
        },
        contents: "Hello, Bob!",
      },
    };

    try {
      const signature = await signTypedDataAsync(typedData);
      alert(`Signature: ${signature}`);
    } catch (error) {
      console.error(error);
      alert("Failed to sign typed data");
    }
  };

  return (
    <div className="flex flex-col gap-2 items-center">
      <div className="flex gap-3 flex-wrap justify-center">
        <button
          onClick={handleSignMessage}
          className="cursor-pointer rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 text-sm"
        >
          Sign Message
        </button>
        <button
          onClick={handleSignTypedData}
          className="cursor-pointer rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 text-sm"
        >
          Sign Typed Data
        </button>
      </div>
      {isMessageVerified && <p>Message signature verified!</p>}
      {isTypedDataVerified && <p>Typed data signature verified!</p>}
    </div>
  );
};

const SendCallsDemo = () => {
  const {
    sendCalls,
    data: sendCallsResult,
    error: sendCallsError,
  } = useSendCalls();

  return (
    <div className="flex flex-col gap-2 items-center">
      <button
        onClick={() => {
          sendCalls({
            calls: [{ to: zeroAddress, data: "0x" }],
          });
        }}
        className="cursor-pointer rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 text-sm"
      >
        Send Calls
      </button>
      {sendCallsResult && (
        <p className="break-all max-w-xl">Calls sent: {sendCallsResult.id}</p>
      )}
      {sendCallsError && (
        <p className="break-all max-w-xl">
          Error sending calls: {JSON.stringify(sendCallsError)}
        </p>
      )}
    </div>
  );
};
