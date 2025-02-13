import { WalletIcon } from "../../../icons/wallet.js";
import { Button } from "../../button.js";
import { useAuthContext } from "../context.js";

export const ExternalWalletsAuth = () => {
  const { setAuthStep } = useAuthContext();

  return (
    <Button
      variant="social"
      icon={<WalletIcon />}
      onClick={() => setAuthStep({ type: "pick_eoa" })}
    >
      Continue with a wallet
    </Button>
  );
};
