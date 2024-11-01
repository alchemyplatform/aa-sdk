"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { RemoveScroll } from "react-remove-scroll";
import { FocusTrap } from "./focustrap.js";

type DialogProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

/**
 * Dialog component that renders a modal dialog.
 *
 * @param {DialogProps} props - The props for the Dialog component.
 * @returns {JSX.Element | null} The rendered Dialog component.
 */
export const Dialog = ({ isOpen, onClose, children }: DialogProps) => {
  const [isScrollLocked, setScrollLocked] = useState(false);

  const [renderPortal, setRenderPortal] = useState(false);

  const backdropRef = useRef<HTMLDivElement>(null);

  const handleBackgroundClick = useCallback(() => {
    onClose();
  }, [onClose]);

  useLayoutEffect(() => {
    const backdrop = backdropRef.current;

    if (isOpen) {
      setRenderPortal(true);
    }

    const renderPortalHandler = () => {
      setRenderPortal(false);
    };

    backdrop?.addEventListener("animationend", renderPortalHandler);

    return () => {
      backdrop?.removeEventListener("animationend", renderPortalHandler);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    // Has to run in the browser
    setScrollLocked(getComputedStyle(document.body).overflow !== "hidden");
  }, []);

  return renderPortal
    ? createPortal(
        <RemoveScroll enabled={isScrollLocked}>
          {/* Overlay */}
          <div
            aria-modal
            role="dialog"
            ref={backdropRef}
            className={`fixed inset-0 bg-black/80 flex items-end md:items-center justify-center z-[999999] transition-opacity ${
              isOpen ? "opacity-100" : "opacity-0 delay-75"
            }`}
            onClick={handleBackgroundClick}
          >
            <FocusTrap>
              <div
                className={`max-md:w-screen md:max-w-sm block ${
                  isOpen ? "animate-slide-up" : "animate-slide-down"
                }`}
                onClick={(event) => event.stopPropagation()}
              >
                {children}
              </div>
            </FocusTrap>
          </div>
        </RemoveScroll>,
        document.body
      )
    : null;
};
