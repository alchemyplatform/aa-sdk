import { useEffect } from "react";
import { useFundingModal } from "../../hooks/useFundingModal.js";

export const FundingEventListener = () => {
  const { openFundingModal } = useFundingModal();

  useEffect(() => {
    const handleOpenFundingModal = (event: CustomEvent) => {
      const { token, network } = event.detail;
      openFundingModal(token, network);
    };

    window.addEventListener(
      "alchemykit:openFundingModal",
      handleOpenFundingModal as EventListener,
    );

    return () => {
      window.removeEventListener(
        "alchemykit:openFundingModal",
        handleOpenFundingModal as EventListener,
      );
    };
  }, [openFundingModal]);

  return null;
};
