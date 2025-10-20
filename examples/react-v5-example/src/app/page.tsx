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
import {
  usePrepareCalls,
  usePrepareSwap,
  useSendEmailOtp,
  useSendSmsOtp,
  useSendPreparedCalls,
  useSubmitOtpCode,
  useLoginWithOauth,
  useHandleOauthRedirect,
  useUser,
  useAuthSession,
  useAuthClient,
  useSendVerificationCode,
  useUpdateEmail,
  useUpdatePhoneNumber,
  useAuthMethods,
} from "@alchemy/react";
import { zeroAddress, Address } from "viem";
import { useState } from "react";

export default function Home() {
  const account = useAccount();

  // Handle OAuth redirect automatically on page load
  const { isPending: isHandlingRedirect, error: redirectError } =
    useHandleOauthRedirect();

  useAccountEffect({
    onConnect(data) {
      console.log("Account connected:", data);
    },
    onDisconnect() {
      console.log("Account disconnected");
    },
  });

  // Show loading state while handling OAuth redirect
  if (isHandlingRedirect) {
    return (
      <div className="flex flex-col items-center justify-items-center min-h-screen p-12 gap-6">
        <p className="font-semibold">Completing OAuth authentication...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-items-center min-h-screen p-12 gap-6">
      {redirectError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          OAuth redirect error: {redirectError.message}
        </div>
      )}
      <p className="font-semibold">{account.status}</p>
      {!account.isConnected ? (
        <AuthenticationDemo />
      ) : (
        <>
          <ChainControls />
          <UserProfileDemo />
          <ConnectorClientDemo />
          <WalletClientDemo />
          <SigningDemo />
          <SendCallsDemo />
          <SendTransactionDemo />
          <SwapDemoWrapper />
          <PrepareAndSendCallsDemoWrapper />
          <CapabilitiesDemo />
        </>
      )}
    </div>
  );
}

const AuthenticationDemo = () => {
  const [authMode, setAuthMode] = useState<"email" | "sms" | "oauth">("email");

  return (
    <div className="flex flex-col gap-4 items-center">
      <div className="flex gap-3">
        <button
          onClick={() => setAuthMode("email")}
          className={`cursor-pointer rounded px-4 py-2 font-bold text-white text-sm ${
            authMode === "email"
              ? "bg-blue-700"
              : "bg-neutral-400 hover:bg-blue-600"
          }`}
        >
          Email
        </button>
        <button
          onClick={() => setAuthMode("sms")}
          className={`cursor-pointer rounded px-4 py-2 font-bold text-white text-sm ${
            authMode === "sms"
              ? "bg-blue-700"
              : "bg-neutral-400 hover:bg-blue-600"
          }`}
        >
          SMS
        </button>
        <button
          onClick={() => setAuthMode("oauth")}
          className={`cursor-pointer rounded px-4 py-2 font-bold text-white text-sm ${
            authMode === "oauth"
              ? "bg-blue-700"
              : "bg-neutral-400 hover:bg-blue-600"
          }`}
        >
          OAuth
        </button>
      </div>
      {authMode === "email" ? (
        <EmailAuthDemo />
      ) : authMode === "sms" ? (
        <SmsAuthDemo />
      ) : (
        <OAuthDemo />
      )}
    </div>
  );
};

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

const UserProfileDemo = () => {
  const user = useUser();
  const authSession = useAuthSession();
  const authClient = useAuthClient();
  const { data: authMethods, isLoading: isLoadingAuthMethods } =
    useAuthMethods();
  const {
    sendVerificationCode,
    isPending: isSendingCode,
    variables: sendVerificationCodeVars,
  } = useSendVerificationCode();
  const { updateEmail, isPending: isUpdatingEmail } = useUpdateEmail();
  const { updatePhoneNumber, isPending: isUpdatingPhone } =
    useUpdatePhoneNumber();

  return (
    <div className="flex flex-col gap-4 items-center border border-gray-300 p-4 rounded">
      <p className="font-semibold text-lg">User Profile</p>

      {/* Display user info */}
      {user && (
        <div className="text-sm bg-gray-100 p-3 rounded w-full max-w-md">
          <p>
            <strong>Address:</strong> {user.address}
          </p>
          <p>
            <strong>Email:</strong> {user.email || "Not set"}
          </p>
          <p>
            <strong>Phone:</strong> {user.phone || "Not set"}
          </p>
          <p>
            <strong>Org ID:</strong> {user.orgId}
          </p>
        </div>
      )}

      {/* Display auth session info */}
      {authSession && (
        <div className="text-xs bg-blue-50 p-2 rounded w-full max-w-md">
          <p>
            <strong>Auth Session:</strong> Active
          </p>
          <p>
            <strong>User ID:</strong> {authSession.getUser().userId}
          </p>
        </div>
      )}

      {/* Display auth client info */}
      {authClient && (
        <div className="text-xs bg-green-50 p-2 rounded w-full max-w-md">
          <p>
            <strong>Auth Client:</strong> Connected
          </p>
        </div>
      )}

      {/* Display auth methods */}
      {isLoadingAuthMethods && (
        <p className="text-sm text-gray-500">Loading auth methods...</p>
      )}
      {authMethods && (
        <div className="text-sm bg-purple-50 p-3 rounded w-full max-w-md">
          <p className="font-semibold mb-2">Authentication Methods:</p>
          <ul className="list-disc list-inside">
            {authMethods.email && (
              <li className="text-xs">
                <strong>Email:</strong> {authMethods.email}
              </li>
            )}
            {authMethods.phone && (
              <li className="text-xs">
                <strong>Phone:</strong> {authMethods.phone}
              </li>
            )}
            {authMethods.oauthProviders.map((provider) => (
              <li key={provider.providerId} className="text-xs">
                <strong>OAuth:</strong> {provider.providerId}
                {provider.userDisplayName && ` (${provider.userDisplayName})`}
              </li>
            ))}
            {authMethods.passkeys.map((passkey) => (
              <li key={passkey.authenticatorId} className="text-xs">
                <strong>Passkey:</strong> {passkey.authenticatorId} (
                {passkey.name})
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Email Management */}
      <div className="flex flex-col gap-2 w-full max-w-md">
        <p className="font-semibold text-sm">Email Management</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const email = prompt("Enter new email address:");
              if (!email) return;
              sendVerificationCode({ contact: email, type: "email" });
            }}
            disabled={
              isSendingCode && sendVerificationCodeVars.type === "email"
            }
            className="cursor-pointer rounded bg-blue-500 px-3 py-1 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSendingCode && sendVerificationCodeVars.type === "email"
              ? "Sending..."
              : "Update Email"}
          </button>
          <button
            onClick={() => {
              const code = prompt("Enter verification code:");
              if (!code) return;
              updateEmail({ verificationCode: code });
            }}
            disabled={isUpdatingEmail}
            className="cursor-pointer rounded bg-green-500 px-3 py-1 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-50"
          >
            {isUpdatingEmail ? "Verifying..." : "Verify Code"}
          </button>
          {user?.email && (
            <button
              onClick={() => {
                if (window.confirm("Remove email from your account?")) {
                  updateEmail({ email: null });
                }
              }}
              disabled={isUpdatingEmail}
              className="cursor-pointer rounded bg-red-500 px-3 py-1 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
            >
              Remove Email
            </button>
          )}
        </div>
      </div>

      {/* Phone Management */}
      <div className="flex flex-col gap-2 w-full max-w-md">
        <p className="font-semibold text-sm">Phone Management</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const phone = prompt(
                "Enter new phone number (E.164 format, e.g., +15551234567):",
              );
              if (!phone) return;
              sendVerificationCode({ contact: phone, type: "phone" });
            }}
            disabled={
              isSendingCode && sendVerificationCodeVars.type === "phone"
            }
            className="cursor-pointer rounded bg-blue-500 px-3 py-1 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSendingCode && sendVerificationCodeVars.type === "phone"
              ? "Sending..."
              : "Update Phone"}
          </button>
          <button
            onClick={() => {
              const code = prompt("Enter verification code:");
              if (!code) return;
              updatePhoneNumber({ verificationCode: code });
            }}
            disabled={isUpdatingPhone}
            className="cursor-pointer rounded bg-green-500 px-3 py-1 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-50"
          >
            {isUpdatingPhone ? "Verifying..." : "Verify Code"}
          </button>
          {user?.phone && (
            <button
              onClick={() => {
                if (window.confirm("Remove phone number from your account?")) {
                  updatePhoneNumber({ phoneNumber: null });
                }
              }}
              disabled={isUpdatingPhone}
              className="cursor-pointer rounded bg-red-500 px-3 py-1 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
            >
              Remove Phone
            </button>
          )}
        </div>
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
  const { sendEmailOtp, isSuccess: sentEmailOtp } = useSendEmailOtp();
  const { submitOtpCode } = useSubmitOtpCode();

  return (
    <div className="flex gap-3">
      <button
        className="cursor-pointer rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
        onClick={() => {
          const email = prompt("Enter your email:");
          if (!email) {
            return;
          }
          sendEmailOtp({ email });
        }}
      >
        {sentEmailOtp ? "Resend" : "Send"} OTP
      </button>
      {sentEmailOtp && (
        <button
          className="cursor-pointer rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
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
      )}
    </div>
  );
};

const SmsAuthDemo = () => {
  const { sendSmsOtp, isSuccess: sentSmsOtp } = useSendSmsOtp();
  const { submitOtpCode } = useSubmitOtpCode();

  return (
    <div className="flex flex-col gap-3 items-center">
      <div className="flex gap-3">
        <button
          className="cursor-pointer rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
          onClick={() => {
            const phoneNumber = prompt(
              "Enter your phone number (E.164 format, e.g., +15551234567):",
            );
            if (!phoneNumber) {
              return;
            }
            sendSmsOtp({ phoneNumber });
          }}
        >
          {sentSmsOtp ? "Resend" : "Send"} SMS OTP
        </button>
        {sentSmsOtp && (
          <button
            className="cursor-pointer rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
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
        )}
      </div>
      <p className="text-xs text-gray-500 max-w-md text-center">
        Phone number must include country code (e.g., +15551234567)
      </p>
    </div>
  );
};

const OAuthDemo = () => {
  const { loginWithOauth, isPending, error, variables } = useLoginWithOauth();

  return (
    <div className="flex flex-col gap-3 items-center">
      <div className="flex gap-3">
        <button
          className="cursor-pointer rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
          disabled={isPending}
          onClick={() => {
            loginWithOauth({
              provider: "google",
              mode: "popup",
            });
          }}
        >
          {isPending && variables.mode === "popup"
            ? "Logging in..."
            : "Google (Popup)"}
        </button>
        <button
          className="cursor-pointer rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
          disabled={isPending}
          onClick={() => {
            loginWithOauth({
              provider: "google",
              mode: "redirect",
            });
          }}
        >
          {isPending && variables.mode === "redirect"
            ? "Logging in..."
            : "Google (Redirect)"}
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-500 max-w-md text-center">
          Error: {error.message}
        </p>
      )}
      <p className="text-xs text-gray-500 max-w-md text-center">
        Popup mode opens OAuth in a new window. Redirect mode navigates away and
        back.
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

const USDC_ARB = "0xaf88d065e77c8cc2239327c5edb3a432268e5831" as const;
const DAI_ARB = "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1" as const;

const SwapDemoWrapper = () => {
  const [fromAmount, setFromAmount] = useState<bigint | undefined>(undefined);

  return fromAmount ? (
    <SwapDemo fromAmount={fromAmount} fromToken={USDC_ARB} toToken={DAI_ARB} />
  ) : (
    <button
      onClick={() => {
        const amount = prompt("Enter from amount (in base units):");
        if (!amount) {
          return;
        }
        setFromAmount(BigInt(amount));
      }}
      className="cursor-pointer rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 text-sm"
    >
      Prepare Swap
    </button>
  );
};

const SwapDemo = ({
  fromToken,
  toToken,
  fromAmount,
}: {
  fromToken: Address;
  toToken: Address;
  fromAmount: bigint;
}) => {
  const {
    data: preparedSwap,
    error: prepareSwapError,
    isFetching,
  } = usePrepareSwap({
    fromToken,
    toToken,
    fromAmount,
  });

  const {
    sendPreparedCalls,
    data: submitSwapResult,
    error: submitSwapError,
    isPending,
  } = useSendPreparedCalls();

  return (
    <div className="flex flex-col gap-2 items-center">
      {preparedSwap && "Swap prepared! (see console)"}
      {prepareSwapError && `Error preparing swap (see console)`}
      <button
        disabled={!preparedSwap || isFetching || isPending}
        onClick={() => {
          if (!preparedSwap) {
            return;
          }
          sendPreparedCalls(preparedSwap);
        }}
        className="cursor-pointer rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 text-sm"
      >
        Execute swap
      </button>
      {submitSwapResult && (
        <p className="break-all max-w-xl">Calls sent: {submitSwapResult.id}</p>
      )}
      {submitSwapError && (
        <p className="break-all max-w-xl">
          Error sending calls: {JSON.stringify(submitSwapError)}
        </p>
      )}
    </div>
  );
};

const PrepareAndSendCallsDemoWrapper = () => {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);

  return isEnabled ? (
    <PrepareAndSendCallsDemo />
  ) : (
    <button
      onClick={() => setIsEnabled(true)}
      className="cursor-pointer rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 text-sm"
    >
      Prepare calls
    </button>
  );
};

const PrepareAndSendCallsDemo = () => {
  const {
    data: preparedCalls,
    error: prepareCallsError,
    isFetching,
  } = usePrepareCalls({
    calls: [{ to: zeroAddress, data: "0x" }],
  });

  console.log({ preparedCalls, prepareCallsError });

  const {
    sendPreparedCalls,
    data: sendCallsResult,
    error: sendCallsError,
    isPending,
  } = useSendPreparedCalls();

  return (
    <div className="flex flex-col gap-2 items-center">
      {preparedCalls && "Calls prepared! (see console)"}
      {prepareCallsError && `Error preparing calls (see console)`}
      <button
        disabled={!preparedCalls || isFetching || isPending}
        onClick={() => {
          if (!preparedCalls) {
            return;
          }
          sendPreparedCalls(preparedCalls);
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
