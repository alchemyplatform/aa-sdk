import { useConfigStore } from "@/state";
import { MFACard } from "./MFACard";
import { MintCard } from "./MintCard";
import { SolanaNftCard } from "./SolanaNftCard";
import { TransactionsCard } from "./TransactionsCard";
import { Erc20SponsorshipCard } from "./Erc20SponsorshipCard";
import { DepositAndSwapsCard } from "./DepositAndSwapsCard";
import { useSigner } from "@account-kit/react";

export const SmallCardsWrapper = () => {
  const { accountMode } = useConfigStore();
  const signer = useSigner();

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:my-6 items-center w-full">
      <button
        onClick={() => {
          const email = window.prompt("Enter email:");
          // @ts-expect-error - this is fine
          signer?.inner.initOtp("email", email);
        }}
      >
        Send Email OTP
      </button>
      <button
        onClick={() => {
          const phone = window.prompt("Enter phone:");
          // @ts-expect-error - this is fine
          signer?.inner.initOtp("sms", phone);
        }}
      >
        Send SMS OTP
      </button>
      <Erc20SponsorshipCard
        accountMode={accountMode}
        key={`erc20-sponsorship-card-${accountMode}`}
      />
      <MintCard accountMode={accountMode} key={`mint-card-${accountMode}`} />
      <TransactionsCard
        accountMode={accountMode}
        key={`transactions-card-${accountMode}`}
      />
      <SolanaNftCard />
      <MFACard />
      <DepositAndSwapsCard />
    </div>
  );
};
