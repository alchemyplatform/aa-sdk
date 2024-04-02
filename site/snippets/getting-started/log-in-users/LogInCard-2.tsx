"use client";

import { useAuthenticateUser } from "@/queries/authenticateUser";
import { AlchemySigner } from "@alchemy/aa-alchemy";
import { useCallback, useState } from "react";

export interface LoginCardProps {
  signer: AlchemySigner | undefined;
}

export const LogInCard = ({ signer }: LoginCardProps) => {
  const [email, setEmail] = useState<string>("");
  const onEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value),
    []
  );

  const { isAuthenticatingUser, authenticateUser } =
    useAuthenticateUser(signer);

  return (
    <div className="flex min-w-80 flex-row justify-center rounded-lg bg-white p-10 dark:bg-[#0F172A]">
      {isAuthenticatingUser ? (
        <div className="text-[18px] font-semibold">Check your email!</div>
      ) : (
        <div className="flex flex-col gap-8">
          <div className="text-[18px] font-semibold">
            Log in to the Embedded Accounts Demo!
          </div>
          <div className="flex flex-col justify-between gap-6">
            <input
              className="rounded-lg border border-[#CBD5E1] p-3 dark:border-[#475569] dark:bg-slate-700 dark:text-white dark:placeholder:text-[#E2E8F0]"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={onEmailChange}
            />
            <button
              className="w-full transform rounded-lg bg-[#363FF9] p-3 font-semibold text-[#FBFDFF] transition duration-500 ease-in-out hover:scale-105"
              onClick={() => authenticateUser({ type: "email", email })}
            >
              Log in
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
