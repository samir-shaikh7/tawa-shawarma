import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    // Reset scroll to top synchronously before the browser paints
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
