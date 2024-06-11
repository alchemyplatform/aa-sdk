import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { MailIcon } from "../icons/mail"
import { WalletIcon } from "../icons/wallet"
import { SocialIcon } from "../icons/social"

export const Authentication = ({ className }: { className?: string }) => {
  const [emailActive, setEmailActive] = useState(true)
  const [walletsActive, setWalletsActive] = useState(false)

  return (
    <div className={cn('', className)}>
      {/* Tabs go here */}

      <div className="flex flex-col gap-4">
        <p className="font-semibold text-secondary-foreground text-sm">Auth methods</p>
        <AuthMethod
          icon={<MailIcon />}
          name="Email"
          active={emailActive}
          disabled
        />
        <AuthMethod
          icon={<WalletIcon />}
          name="External wallets"
          active={walletsActive}
          setActive={setWalletsActive}
        />
        <AuthMethod
          icon={<SocialIcon className="opacity-50" />}
          name="Social auth"
          unavailable
        />
      </div>
    </div>
  )
}

const AuthMethod = ({
  icon,
  name,
  active = false,
  disabled = false,
  unavailable = false,
  setActive,
}: {
  icon: React.ReactNode
  name: string
  active?: boolean
  disabled?: boolean
  unavailable?: boolean
  setActive?: (active: boolean) => void
}) => {
  return (
    <div className="flex items-center border rounded-lg px-4 py-3">
      {icon}
      <p className={cn("ml-2 mr-3 font-semibold", unavailable && 'opacity-50')}>
        {name}
      </p>

      {unavailable ? (
        <div className="ml-auto border border-border/50 px-2 py-1 rounded-sm">
          <p className="text-xs font-semibold">Coming soon</p>
        </div>
      ) : (
        <Switch
          disabled={disabled}
          checked={active}
          onCheckedChange={setActive}
          className="ml-auto"
        />
      )}
    </div>
  )
}
