import { Dialog } from "../dialog/dialog.js";
import { FundingCard } from "./card/index.js";
import { useFundingModal } from "../../hooks/useFundingModal.js";

export const FundingModal = () => {
  const { isOpen, closeFundingModal } = useFundingModal();

  return (
    <Dialog isOpen={isOpen} onClose={closeFundingModal} fullWidth>
      <div className="akui-modal w-full md:w-[400px] md:h-[600px] md:max-h-[90vh] overflow-hidden flex flex-col mx-auto">
        <FundingCard showClose />
      </div>
    </Dialog>
  );
};
