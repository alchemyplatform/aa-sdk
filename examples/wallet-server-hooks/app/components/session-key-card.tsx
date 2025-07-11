import { Loader2, PlusCircle, ExternalLink, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useCallback, useState } from "react";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import {
  useGrantPermissions,
  usePrepareCalls,
  useSendCalls,
  useSendPreparedCalls,
  useSmartWalletClient,
} from "@account-kit/react/experimental";
import { useSmartAccountClient } from "@account-kit/react";
import { zeroAddress } from "viem";
import { signPreparedCalls } from "@account-kit/wallet-client";
import { LocalAccountSigner } from "@aa-sdk/core";
import Link from "next/link";

export default function SessionKeyCard() {
  const { client } = useSmartAccountClient({});
  const walletClient = useSmartWalletClient({
    account: client?.account.address,
  });
  const [sessionKeySigner] = useState(() =>
    LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey()),
  );

  const { grantPermissions, isGrantingPermissions, grantPermissionsResult } =
    useGrantPermissions({
      client: walletClient,
    });

  const { prepareCallsAsync } = usePrepareCalls({ client: walletClient });
  const { sendPreparedCallsAsync, sendPreparedCallsResult } =
    useSendPreparedCalls({ client: walletClient });

  const handleCreateSessionKey = useCallback(async () => {
    grantPermissions({
      key: {
        type: "secp256k1",
        publicKey: await sessionKeySigner.getAddress(),
      },
      permissions: [{ type: "root" }],
    });
  }, [grantPermissions]);

  const [isSendingTransaction, setSendingTransaction] = useState(false);

  const handleSendTransaction = useCallback(async () => {
    if (!walletClient) {
      throw new Error("Missing wallet client");
    }
    if (!grantPermissionsResult?.context) {
      throw new Error("Missing permissions context");
    }
    setSendingTransaction(true);
    try {
      const prepared = await prepareCallsAsync({
        calls: [{ to: zeroAddress, data: "0x" }],
        capabilities: {
          permissions: grantPermissionsResult,
        },
      });
      const signedCalls = await signPreparedCalls(
        // TODO(jh): should we create a hook for this?
        sessionKeySigner,
        prepared,
      );
      const result = await sendPreparedCallsAsync({
        ...signedCalls,
        capabilities: {
          permissions: grantPermissionsResult,
        },
      });
      alert(`Success: ${result.preparedCallIds[0]}`);
    } catch (err) {
      alert(`Error: ${err}`);
    } finally {
      setSendingTransaction(false);
    }
  }, [grantPermissionsResult, sessionKeySigner, walletClient]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-0">
        <CardTitle className="mb-2">Create a session key</CardTitle>
        <CardDescription>Grant permissions using a session key</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 flex justify-between w-full items-end">
        <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center">
          <Button
            className="w-full sm:w-auto gap-2 relative overflow-hidden group"
            size="lg"
            onClick={handleCreateSessionKey}
            disabled={isGrantingPermissions || !!grantPermissionsResult}
          >
            <span
              className={cn(
                "flex items-center gap-2 transition-transform duration-300",
                isGrantingPermissions ? "translate-y-10" : "",
              )}
            >
              <PlusCircle className="h-[18px] w-[18px]" />
              Create session key
            </span>
            <span
              className={cn(
                "absolute inset-0 flex items-center justify-center transition-transform duration-300",
                isGrantingPermissions ? "translate-y-0" : "translate-y-10",
              )}
            >
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
              Granting permissions...
            </span>
          </Button>
          <Button
            className="w-full sm:w-auto gap-2 relative overflow-hidden group"
            size="lg"
            onClick={handleSendTransaction}
            disabled={isSendingTransaction || !grantPermissionsResult}
          >
            <span
              className={cn(
                "flex items-center gap-2 transition-transform duration-300",
                isSendingTransaction ? "translate-y-10" : "",
              )}
            >
              <PlusCircle className="h-[18px] w-[18px]" />
              Send transaction
            </span>
            <span
              className={cn(
                "absolute inset-0 flex items-center justify-center transition-transform duration-300",
                isSendingTransaction ? "translate-y-0" : "translate-y-10",
              )}
            >
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
              Sending transaction...
            </span>
          </Button>
        </div>
        <div>
          {grantPermissionsResult && (
            <Button
              variant="outline"
              size="lg"
              className={cn(
                "gap-2 w-full sm:w-auto relative overflow-hidden transition-all duration-500",
                "border-green-400 text-green-700 hover:bg-green-50",
                "animate-in fade-in duration-700 pointer-events-none",
              )}
            >
              <>
                <div
                  className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 opacity-10"
                  style={{
                    animation: "sweep 1.5s ease-out",
                  }}
                />
                <span className="relative z-10">Granted permissions!</span>
                <CheckCircle className="h-4 w-4 relative z-10" />
                <style jsx>{`
                  @keyframes sweep {
                    0% {
                      transform: translateX(-100%);
                      opacity: 0;
                    }
                    50% {
                      opacity: 0.2;
                    }
                    100% {
                      transform: translateX(100%);
                      opacity: 0;
                    }
                  }
                `}</style>
              </>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
