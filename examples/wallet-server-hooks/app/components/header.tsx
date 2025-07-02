import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useLogout, useSignerStatus } from "@account-kit/react";
import Image from "next/image";

export default function Header() {
  const { logout } = useLogout();
  const { isConnected } = useSignerStatus();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Image
            src="/smart-wallets.svg"
            alt="Smart Wallets"
            width={200}
            height={26}
            className="h-6 w-auto"
          />
        </div>

        {isConnected && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => logout()}
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        )}
      </div>
    </header>
  );
}
