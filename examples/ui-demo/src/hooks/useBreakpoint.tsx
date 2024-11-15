import { useLayoutEffect, useState } from "react";

// Define the breakpoints based on Tailwind CSS defaults (or your custom Tailwind configuration)
const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

type Breakpoint = keyof typeof breakpoints;

/**
 * Custom hook to get the current active breakpoint based on window width
 *
 * @returns {Breakpoint} The current active breakpoint
 */
export const useBreakpoint = (): Breakpoint | undefined => {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>();

  useLayoutEffect(() => {
    const getBreakpoint = (width: number): Breakpoint => {
      if (width >= breakpoints["2xl"]) return "2xl";
      if (width >= breakpoints.xl) return "xl";
      if (width >= breakpoints.lg) return "lg";
      if (width >= breakpoints.md) return "md";
      return "sm";
    };

    const handleResize = () => {
      const width = window.innerWidth;
      const breakpoint = getBreakpoint(width);
      setCurrentBreakpoint(breakpoint);
    };

    window.addEventListener("resize", handleResize);

    // Call the handler initially to set the correct breakpoint
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return currentBreakpoint;
};
