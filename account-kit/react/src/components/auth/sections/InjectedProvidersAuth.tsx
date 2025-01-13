import { WalletIcon } from "../../../icons/wallet.js";
import { Button } from "../../button.js";
import { AuthStepType, useAuthContext } from "../context.js";

export const ExternalWalletsAuth = () => {
  const { setAuthStep } = useAuthContext();

  return (
    <Button
      variant="social"
      icon={<WalletIcon />}
      onClick={() => setAuthStep({ type: AuthStepType.PickEoa })}
    >
      Continue with a wallet
    </Button>
  );
};
