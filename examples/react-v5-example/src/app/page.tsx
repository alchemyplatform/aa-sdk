"use client";

import {
  useAccount,
  useAccountEffect,
  useChainId,
  useConnectorClient,
  useDisconnect,
  useSendTransaction,
  useSignMessage,
  useSignTypedData,
  useSwitchChain,
  useVerifyMessage,
  useVerifyTypedData,
  useWalletClient,
  useCapabilities,
  useSendCalls,
  useWaitForCallsStatus,
} from "wagmi";
import { useSendEmailOtp, useSubmitOtpCode } from "@alchemy/react";
import { zeroAddress } from "viem";

export default function Home() {
  const account = useAccount();

  useAccountEffect({
    onConnect(data) {
      console.log("Account connected:", data);
    },
    onDisconnect() {
      console.log("Account disconnected");
    },
  });

  return (
    <div className="flex flex-col items-center justify-items-center min-h-screen p-12 gap-6">
      <p className="font-semibold">
        {account.isConnected ? "Connected" : "Not connected"}
      </p>
      {!account.isConnected ? (
        <EmailAuthDemo />
      ) : (
        <>
          <ChainControls />
          <ConnectorClientDemo />
          <WalletClientDemo />
          <SigningDemo />
          <SendCallsDemo />
          <SendTransactionDemo />
          <CapabilitiesDemo />
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

const CapabilitiesDemo = () => {
  const { data: capabilities } = useCapabilities();

  return (
    <div className="flex flex-col gap-2 items-center">
      <p className="font-semibold">Wallet Capabilities</p>
      {capabilities && (
        <pre className="text-xs bg-gray-100 p-3 rounded max-w-2xl overflow-auto">
          {JSON.stringify(capabilities, null, 2)}
        </pre>
      )}
    </div>
  );
};

const ConnectorClientDemo = () => {
  const { data: connectorClient } = useConnectorClient();

  return (
    <div className="flex flex-col gap-2 items-center">
      <p className="font-semibold">Connector Client</p>
      {connectorClient && (
        <div className="text-xs bg-gray-100 p-3 rounded max-w-2xl">
          <p>Name: {connectorClient.name}</p>
          <p>Type: {connectorClient.type}</p>
          <p>Chain ID: {connectorClient.chain.id}</p>
          <p>Account: {connectorClient.account.address}</p>
        </div>
      )}
    </div>
  );
};

const WalletClientDemo = () => {
  const { data: walletClient } = useWalletClient();

  return (
    <div className="flex flex-col gap-2 items-center">
      <p className="font-semibold">Wallet Client</p>
      {walletClient && (
        <div className="text-xs bg-gray-100 p-3 rounded max-w-2xl">
          <p>Name: {walletClient.name}</p>
          <p>Type: {walletClient.type}</p>
          <p>Chain ID: {walletClient.chain.id}</p>
          <p>Account: {walletClient.account.address}</p>
        </div>
      )}
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
    isPending,
    data: sendCallsResult,
    error: sendCallsError,
  } = useSendCalls();

  const {
    data: callsStatus,
    isLoading: isWaitingForCalls,
    error: callsStatusError,
  } = useWaitForCallsStatus({
    id: sendCallsResult?.id,
    status: ({ statusCode }) => statusCode === 200,
    query: {
      enabled: !!sendCallsResult,
    },
  });

  return (
    <div className="flex flex-col gap-2 items-center">
      <button
        disabled={isPending}
        onClick={() => {
          sendCalls({
            calls: [{ to: zeroAddress, data: "0x" }],
          });
        }}
        className="enabled:cursor-pointer disabled:cursor-not-allowed rounded bg-blue-500 px-4 py-2 font-bold text-white enabled:hover:bg-blue-700 text-sm disabled:opacity-50"
      >
        Send Calls
      </button>
      {sendCallsResult && (
        <p className="break-all max-w-xl">Calls sent: {sendCallsResult.id}</p>
      )}
      {isWaitingForCalls && <p>Waiting for calls to confirm...</p>}
      {callsStatus && (
        <div className="text-xs bg-green-100 p-3 rounded max-w-2xl">
          <p className="font-semibold">Calls Status</p>
          <p>Status: {callsStatus.status}</p>
          <p>Status Code: {callsStatus.statusCode}</p>
        </div>
      )}
      {sendCallsError && (
        <p className="break-all max-w-xl">
          Error sending calls: {JSON.stringify(sendCallsError)}
        </p>
      )}
      {callsStatusError && (
        <p className="break-all max-w-xl">
          Error getting calls status: {JSON.stringify(callsStatusError)}
        </p>
      )}
    </div>
  );
};

const SendTransactionDemo = () => {
  const {
    sendTransaction,
    isPending,
    data: sendTransactionResult,
    error: sendTransactionError,
  } = useSendTransaction();

  return (
    <div className="flex flex-col gap-2 items-center">
      <button
        disabled={isPending}
        onClick={() => {
          sendTransaction({
            to: zeroAddress,
            data: "0x",
          });
        }}
        className="enabled:cursor-pointer disabled:cursor-not-allowed rounded bg-blue-500 px-4 py-2 font-bold text-white enabled:hover:bg-blue-700 text-sm disabled:opacity-50"
      >
        Send Transaction
      </button>
      {sendTransactionResult && (
        <p className="break-all max-w-xl">
          Transaction sent: {sendTransactionResult}
        </p>
      )}
      {sendTransactionError && (
        <p className="break-all max-w-xl">
          Error sending transaction: {JSON.stringify(sendTransactionError)}
        </p>
      )}
    </div>
  );
};
