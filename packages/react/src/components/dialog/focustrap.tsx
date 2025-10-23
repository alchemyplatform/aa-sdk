// Adapted from: https://hiddedevries.nl/en/blog/2017-01-29-using-javascript-to-trap-focus-in-an-element

import { useRef, useEffect, type PropsWithChildren } from "react";

function useTrapFocus() {
  const ref = useRef<HTMLDivElement>(null);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!ref.current) {
      return;
    }

    // Elements that can receive focus
    const focusableElements = ref.current.querySelectorAll<HTMLElement>(`
      a[href]:not([disabled]),
      button:not([disabled]),
      textarea:not([disabled]),
      input[type="text"]:not([disabled]),
      input[type="radio"]:not([disabled]),
      input[type="checkbox"]:not([disabled]),
      select:not([disabled])
    `);

    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement =
      focusableElements[focusableElements.length - 1];

    const isPressingTab = event.key === "Tab";

    if (!isPressingTab) {
      return;
    }

    if (event.shiftKey) {
      // Shift + tab
      if (document.activeElement === firstFocusableElement) {
        lastFocusableElement.focus();
        event.preventDefault();
      }
    } else {
      // Just tab
      if (document.activeElement === lastFocusableElement) {
        firstFocusableElement.focus();
        event.preventDefault();
      }
    }
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }

    el.addEventListener("keydown", handleKeyDown);
    el.focus({ preventScroll: true });

    return () => {
      el.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return { ref };
}

export const FocusTrap = ({ children }: PropsWithChildren<{}>) => {
  const { ref } = useTrapFocus();

  useEffect(() => {
    if (ref.current) {
      ref.current.focus({ preventScroll: true });
    }
  }, [ref]);

  return (
    <div ref={ref} tabIndex={0} className="focus:outline-none">
      {children}
    </div>
  );
};
