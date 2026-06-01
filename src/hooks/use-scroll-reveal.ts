import { useEffect, useRef, useCallback } from "react";

/** 
 * Optimized Scroll Reveal Hook.
 * Instead of an expensive MutationObserver, we use a manual sync function 
 * that can be called after async data (Supabase) hydrates the DOM.
 */
export function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const ioRef = useRef<IntersectionObserver | null>(null);

  const sync = useCallback(() => {
    // Disconnect previous observer if it exists
    if (ioRef.current) {
      ioRef.current.disconnect();
    }

    const root = ref.current ?? document;
    const targets = root.querySelectorAll(".reveal:not(.in)");

    ioRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            ioRef.current?.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    targets.forEach((t) => ioRef.current?.observe(t));
  }, []);

  useEffect(() => {
    sync();
    return () => ioRef.current?.disconnect();
  }, [sync]);

  return { ref, sync };
}
