import { useConfigStore } from "@/state";
import { MFACard } from "./MFACard";
import { MintCard } from "./MintCard";
import { SolanaNftCard } from "./SolanaNftCard";
import { TransactionsCard } from "./TransactionsCard";
import { Erc20SponsorshipCard } from "./Erc20SponsorshipCard";
import { DepositAndSwapsCard } from "./DepositAndSwapsCard";
import { useSigner } from "@account-kit/react";
import { useState } from "react";

export const SmallCardsWrapper = () => {
  const { accountMode } = useConfigStore();
  const signer = useSigner();
  const [otpId, setOtpId] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState("");

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:my-6 items-center w-full">
      <button
        onClick={async () => {
          const email = window.prompt("Enter email:");
          const result = await signer!.inner.initOtp("email", email ?? "");
          console.log({ result });
          setOtpId(result.otpId);
          setEmail(email ?? "");
        }}
      >
        Send Email OTP
      </button>
      <button
        onClick={async () => {
          const input = window.prompt("Enter phone:");
          const result = await signer!.inner.initOtp("sms", input ?? "");
          console.log({ result });
          setOtpId(result.otpId);
          setPhone(input!);
        }}
      >
        Send SMS OTP
      </button>
      <button
        onClick={async () => {
          const input = window.prompt("Enter code:");
          const result = await signer!.inner.verifyOtp(otpId, input ?? "");
          console.log({ result });
          setToken(result.verificationToken);
        }}
      >
        Verify OTP
      </button>
      <button
        onClick={async () => {
          const result = await signer!.inner.setEmail(email, token);
          console.log({ result });
        }}
      >
        Update email
      </button>
      <button
        onClick={async () => {
          const result = await signer!.inner.setPhoneNumber(phone, token);
          console.log({ result });
        }}
      >
        Update phone
      </button>
      <button
        onClick={async () => {
          const result = await signer!.inner.whoami();
          console.log({ result });
        }}
      >
        Whoami
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
