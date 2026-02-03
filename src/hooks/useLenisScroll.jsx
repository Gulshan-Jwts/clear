// hooks/useLenisScroll.js;
import { useEffect } from "react";
import Lenis from "@studio-freight/lenis";

export function useLenisScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,
      smooth: true,
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);
}
