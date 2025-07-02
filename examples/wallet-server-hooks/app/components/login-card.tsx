"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAuthModal } from "@account-kit/react";
export default function LoginPage() {
  const { openAuthModal } = useAuthModal();

  return (
    <Card
      className={cn(
        "relative w-full max-w-md shadow-xl border border-gray-200/50",
        "bg-white/70 dark:bg-gray-900/70 backdrop-blur-md",
        "hover:shadow-2xl transition-all duration-300",
      )}
    >
      <CardHeader className={cn("text-center space-y-4 pb-8")}>
        <CardTitle
          className={cn(
            "text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600",
            "dark:from-white dark:to-gray-300 bg-clip-text text-transparent",
          )}
        >
          Smart Wallets
        </CardTitle>
        <CardDescription
          className={cn("text-base text-gray-600 dark:text-gray-400")}
        >
          Experience seamless onchain UX with smart wallets. Click log in to
          continue.
        </CardDescription>
      </CardHeader>

      <CardContent className={cn("space-y-6 pb-8")}>
        <Button
          size="lg"
          onClick={() => openAuthModal()}
          className={cn(
            "w-full h-12 text-base font-medium bg-gradient-to-r from-gray-600/80 to-gray-800/80",
            "hover:from-gray-700/90 hover:to-gray-900/90 border-0 shadow-lg hover:shadow-xl",
            "dark:from-gray-300/20 dark:to-gray-500/30 dark:hover:from-gray-200/30 dark:hover:to-gray-400/40",
            "backdrop-blur-sm text-white dark:text-gray-100",
            "transition-all duration-200",
          )}
        >
          Login
        </Button>
      </CardContent>
    </Card>
  );
}
