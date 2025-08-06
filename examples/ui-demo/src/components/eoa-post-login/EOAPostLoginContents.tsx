import {
  useLogout,
  useSolanaSignMessage,
  useSolanaTransaction,
  useUser,
} from "@account-kit/react";
import { CheckIcon } from "../icons/check";
import { GasIcon } from "../icons/gas";
import { UserIcon } from "../icons/user";
import { WalletIcon } from "../icons/wallet";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { useToast } from "@/hooks/useToast";
import { Button } from "../shared/Button";

export const EOAPostLoginActions = () => {
  const { logout } = useLogout();
  return (
    <div className="flex flex-col items-center justify-center px-6 lg:px-0">
      <p className="text-demo-fg-secondary lg:text-fg-secondary text-sm text-center mt-4 lg:mt-0">
        <span>
          Want to experience{" "}
          <span
            style={{
              background: "linear-gradient(132deg, #FF9C27 0%, #FD48CE 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            gasless checkout?
          </span>
        </span>
        <br />
        <span>Login with an email instead</span>
      </p>
      <div className="flex flex-col lg:flex-row w-full mt-4">
        <button
          className="akui-btn akui-btn-primary w-full lg:w-auto mb-4 lg:mb-0 flex-1 m-0 lg:mr-2"
          onClick={() => {
            logout();
          }}
        >
          Switch Login
        </button>
        <a
          href="https://www.alchemy.com/docs/wallets/"
          target="_blank"
          className="akui-btn akui-btn-secondary w-full lg:w-auto flex-1 m-0 lg:ml-2"
        >
          View docs
        </a>
      </div>
    </div>
  );
};

export const EOAPostLoginContents = () => {
  const solTx = useSolanaTransaction({
    policyId: "e2f15d98-2111-42a3-bde8-db46e07eede0",
  });
  const solMsg = useSolanaSignMessage({});
  const user = useUser();
  const { setToast } = useToast();

  if (!user) return null;

  // Check if user is connected with a Solana wallet
  const isSolanaWallet = !!user.solanaAddress;

  return (
    <div className="flex flex-col">
      <div className="flex flex-col items-center justify-center">
        <CheckIcon className="w-[48px] h-[48px] stroke-demo-surface-success" />
        <h3 className="text-[32px] tracking-tight font-semibold mt-5 text-fg-primary whitespace-nowrap">{`You're connected!`}</h3>
      </div>
      <div className="flex flex-col mt-6 mx-3.5 lg:mx-0">
        <Capabilities
          icon="connect"
          title="Connect existing users"
          description={
            <>
              <p className="hidden lg:block">
                Reliable wallet connectors make it easy for you to connect all
                of your existing web3 users
              </p>
              <p className="block lg:hidden">
                Reliable wallet connectors make it easy to connect your existing
                users
              </p>
            </>
          }
        />
        <Capabilities
          icon="onboard"
          title="Onboard mainstream users"
          description={
            <>
              <p className="hidden lg:block">
                Embedded wallets with email, social, and passkey local to bring
                mainstream users onchain
              </p>
              <p className="block lg:hidden">
                Embedded wallets with email, social, and passkey to bring users
                onchain
              </p>
            </>
          }
        />
        <Capabilities
          icon="sponsor"
          title="Sponsor gas fees"
          description={
            <>
              <p className="hidden lg:block">
                Gasless transactions available now for embedded wallets and
                coming soon to EOAs
              </p>
              <p className="block lg:hidden">
                Gasless transactions available now for embedded wallets and
                coming soon to EOAs
              </p>
            </>
          }
        />

        {/* Solana Wallet Actions - Only show if connected with Solana wallet */}
        {isSolanaWallet && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-fg-primary mb-4">
              Try Solana Features
            </h4>
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => {
                  solTx
                    .sendTransactionAsync({
                      instructions: [
                        SystemProgram.transfer({
                          fromPubkey: new PublicKey(user.solanaAddress!),
                          toPubkey: new PublicKey(user.solanaAddress!),
                          lamports: 0, // transferring 0 lamports to self
                        }),
                      ],
                    })
                    .then((tx) => {
                      console.log(tx);
                      setToast({
                        text: "Sponsored transaction sent! Hash: " + tx.hash,
                        type: "success",
                        open: true,
                      });
                    })
                    .catch((error) => {
                      console.error(error);
                      setToast({
                        text: "Transaction failed: " + error.message,
                        type: "error",
                        open: true,
                      });
                    });
                }}
                className="!bg-gradient-to-r !from-orange-400 !to-pink-500 !text-white !border-orange-400 hover:!from-orange-500 hover:!to-pink-600 transition-all duration-200"
              >
                Send Sponsored Transaction
              </Button>
              <Button
                onClick={() => {
                  solMsg
                    .signMessageAsync({ message: "Hello from Solana wallet!" })
                    .then((signature) =>
                      setToast({
                        text:
                          "Message signed! Signature: " +
                          signature.slice(0, 10) +
                          "...",
                        type: "success",
                        open: true,
                      }),
                    )
                    .catch((error) => {
                      console.error(error);
                      setToast({
                        text: "Signing failed: " + error.message,
                        type: "error",
                        open: true,
                      });
                    });
                }}
                className="!bg-purple-600 !text-white !border-purple-600 hover:!bg-purple-700 transition-all duration-200"
              >
                Sign Message
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

type IconType = "connect" | "onboard" | "sponsor";

const Capabilities = ({
  icon,
  title,
  description,
}: {
  icon: IconType;
  title: string;
  description: string | JSX.Element;
}) => {
  return (
    <div className="flex gap-3 mb-6 lg:mb-10">
      {getPropIcon(icon)}
      <div className=" w-full">
        <h3 className="text-base font-semibold text-fg-secondary">{title}</h3>
        <div className="text-base leading-6 text-fg-secondary">
          {description}
        </div>
      </div>
    </div>
  );
};

const getPropIcon = (icon: IconType) => {
  switch (icon) {
    case "connect":
      return <WalletIcon className="stroke-fg-secondary w-[24px] h-[24px]" />;
    case "onboard":
      return <UserIcon className="stroke-fg-secondary w-[24px] h-[24px]" />;
    case "sponsor":
      return <GasIcon className="stroke-fg-secondary w-[24px] h-[24px]" />;
  }
};
