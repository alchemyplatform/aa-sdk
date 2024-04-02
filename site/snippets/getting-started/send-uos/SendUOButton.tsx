import { useSendUserOperation } from "@/queries/sendUserOperation";
import { MultiOwnerModularAccount } from "@alchemy/aa-accounts";
import { AlchemySmartAccountClient } from "@alchemy/aa-alchemy";
import { Chain, Transport } from "viem";
import { arbitrumSepolia } from "viem/chains";

export interface SendUOButtonProps {
  provider:
    | AlchemySmartAccountClient<Transport, Chain, MultiOwnerModularAccount>
    | undefined;
}

export const SendUOButton = ({ provider }: SendUOButtonProps) => {
  const {
    sendUserOperation,
    txnHash,
    isPendingUserOperation,
    isSendUserOperationError,
  } = useSendUserOperation(provider);

  return (
    <div className="flex flex-col">
      {txnHash == null ? (
        <button
          className="w-full transform rounded-lg bg-[#363FF9] p-3 font-semibold text-[#FBFDFF] transition duration-500 ease-in-out hover:scale-105 disabled:bg-[#C0D4FF] disabled:hover:scale-100 dark:disabled:bg-[#4252C5]"
          onClick={() => sendUserOperation()}
          disabled={isPendingUserOperation}
        >
          <div className="flex flex-row items-center justify-center gap-3">
            {isPendingUserOperation && (
              <div
                className="text-surface inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-e-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
                role="status"
              ></div>
            )}
            {isPendingUserOperation
              ? "Sending"
              : isSendUserOperationError
              ? "An error occurred. Try again!"
              : "Send a test transaction"}
          </div>
        </button>
      ) : (
        <a
          href={`${arbitrumSepolia.blockExplorers.default.url}/tx/${txnHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full transform rounded-lg bg-[#363FF9] p-3 font-semibold transition duration-500 ease-in-out hover:scale-105"
        >
          View transaction details
        </a>
      )}
    </div>
  );
};
