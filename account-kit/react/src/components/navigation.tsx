import { BackArrow, X } from "../icons/nav.js";
import { Button } from "./button.js";

interface NavigationProps {
  onBack?: () => void;
  onClose: () => void;
  showBack?: boolean;
  showClose: boolean;
}

// eslint-disable-next-line jsdoc/require-jsdoc
export const Navigation = ({
  showBack = false,
  showClose,
  onBack,
  onClose,
}: NavigationProps) => {
  return (
    <div className="flex items-center justify-between w-full px-6 pt-5">
      <Button
        variant="link"
        onClick={onBack}
        disabled={!showBack}
        className={
          showBack
            ? "text-fg-secondary w-[40px] h-[40px] flex items-center justify-center hover:bg-btn-secondary rounded-md"
            : "invisible"
        }
      >
        <BackArrow
          width="22"
          height="22"
          className="w-[24px] h-[24px] lg:w-[16px] lg:h-[16px]"
        />
      </Button>

      <Button
        variant="link"
        onClick={onClose}
        className={
          showClose
            ? "text-fg-secondary w-[40px] h-[40px] flex items-center justify-center hover:bg-btn-secondary rounded-md"
            : "invisible"
        }
      >
        <X
          width="22"
          height="22"
          className="w-[24px] h-[24px] lg:w-[16px] lg:h-[16px]"
        />
      </Button>
    </div>
  );
};
