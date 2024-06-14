import { BackArrow, X } from "../icons/nav.js";
import { Button } from "./button.js";

interface NavigationProps {
  onBack?: () => void;
  onClose: () => void;
  showBack: boolean;
  showClose: boolean;
}

// eslint-disable-next-line jsdoc/require-jsdoc
export const Navigation = ({
  showBack,
  showClose,
  onBack,
  onClose,
}: NavigationProps) => {
  return (
    <div className="flex items-center justify-between w-full">
      <Button
        variant="link"
        onClick={onBack}
        disabled={!showBack}
        className={showBack ? "text-fg-secondary" : "invisible"}
      >
        <BackArrow />
      </Button>

      <Button
        variant="link"
        onClick={onClose}
        className={showClose ? "text-fg-secondary" : "invisible"}
      >
        <X />
      </Button>
    </div>
  );
};
