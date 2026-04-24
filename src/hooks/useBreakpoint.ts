import { useEffect, useState } from "react";

const MD = "(min-width: 768px)";
const LG = "(min-width: 1024px)";

export interface Breakpoint {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

function read(): Breakpoint {
  if (typeof window === "undefined") {
    return { isMobile: false, isTablet: false, isDesktop: true };
  }
  const mdUp = window.matchMedia(MD).matches;
  const lgUp = window.matchMedia(LG).matches;
  return {
    isMobile: !mdUp,
    isTablet: mdUp && !lgUp,
    isDesktop: lgUp,
  };
}

export function useBreakpoint(): Breakpoint {
  const [state, setState] = useState<Breakpoint>(read);

  useEffect(() => {
    const md = window.matchMedia(MD);
    const lg = window.matchMedia(LG);
    const update = () => setState(read());
    md.addEventListener("change", update);
    lg.addEventListener("change", update);
    update();
    return () => {
      md.removeEventListener("change", update);
      lg.removeEventListener("change", update);
    };
  }, []);

  return state;
}
