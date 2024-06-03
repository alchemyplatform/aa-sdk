import { BackArrow, X } from "../icons/nav.js";
import { Button } from "./button.js";

interface NavigationProps {
  onBack?: () => void;
  onClose: () => void;
  showingBack: boolean;
}

// eslint-disable-next-line jsdoc/require-jsdoc
export const Navigation = ({
  showingBack,
  onBack,
  onClose,
}: NavigationProps) => {
  return (
    <div className="flex items-center justify-between w-full">
      <Button
        type="link"
        onClick={onBack}
        disabled={!showingBack}
        className={showingBack ? "text-fg-primary" : "invisible"}
      >
        <BackArrow />
      </Button>

      <Button type="link" onClick={onClose} className="text-fg-primary">
        <X />
      </Button>
    </div>
  );
};
