import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";

import { useSettings } from "@/lib/settings";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/#menu", label: "Menu" },
  { href: "/track", label: "Track Order" },
  { href: "/#gallery", label: "Gallery" },
  { href: "/#about", label: "About" },
  { href: "/#reviews", label: "Reviews" },
  { href: "/#contact", label: "Contact" },
];

export function Navbar() {
  const { totalItems } = useCart();
  const { settings } = useSettings();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [open]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? "py-2" : "py-5"}`}
    >
      <div className="mx-auto max-w-7xl px-4">
        <nav
          className="flex items-center justify-between rounded-[2rem] px-5 py-2.5 glass shadow-soft border-white/50 backdrop-blur-xl"
          aria-label="Main navigation"
        >
          <Link
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="group flex items-center gap-3"
          >
            <div className="h-10 w-10 overflow-hidden rounded-full shadow-soft transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
              <img src="/logo.png" alt={`${settings.name} Logo`} className="h-full w-full object-cover" width={40} height={40} />
            </div>
            <span className="font-display text-xl font-bold tracking-tight transition-colors duration-300 group-hover:text-amber">{settings.name}</span>
          </Link>

          <ul className="hidden items-center gap-2 lg:flex">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  to={l.href}
                  onClick={() => {
                    if (l.label === "Home") window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="relative rounded-full px-4 py-2 text-sm font-semibold text-foreground/70 transition-all duration-300 hover:text-amber group/link"
                >
                  {l.label}
                  <span className="absolute bottom-1.5 left-1/2 h-0.5 w-0 -translate-x-1/2 bg-amber transition-all duration-300 group-hover/link:w-1/3" />
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2 md:gap-3">
            <Link
              to="/cart"
              className="relative flex items-center justify-center rounded-xl bg-white p-2.5 text-foreground/70 shadow-sm transition hover:text-amber md:h-12 md:w-12 md:rounded-full md:p-0"
              aria-label="View Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full bg-red-500 text-[9px] md:text-[10px] font-bold text-white shadow-soft">
                  {totalItems}
                </span>
              )}
            </Link>
            <Link
              to="/#menu"
              className="hidden rounded-full gradient-primary px-7 py-3 text-sm font-bold text-white shadow-glow btn-glow md:inline-flex"
            >
              View Menu
            </Link>
            <button
              className="rounded-xl bg-muted/40 p-2.5 lg:hidden text-amber transition-all active:scale-95"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </nav>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-charcoal/30 backdrop-blur-md animate-fade-in" onClick={() => setOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-80 max-w-full bg-white p-6 shadow-elegant animate-slide-in-right">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 overflow-hidden rounded-xl shadow-soft">
                  <img src="/logo.png" alt={`${settings.name} Logo`} className="h-full w-full object-cover" width={40} height={40} />
                </div>
                <span className="font-display text-lg font-bold tracking-tight">{settings.name}</span>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-gold/15" aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <ul className="mt-8 space-y-1">
              {LINKS.map((l, i) => (
                <li key={l.href} className="animate-fade-up" style={{ animationDelay: `${i * 0.05}s`, animationFillMode: "both" }}>
                  <Link
                    to={l.href}
                    onClick={() => {
                      setOpen(false);
                      if (l.label === "Home") window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="block rounded-xl px-4 py-3 text-base font-medium text-foreground/85 transition hover:bg-gold/15 hover:text-amber active:scale-[0.98]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              to="/#menu"
              onClick={() => setOpen(false)}
              className="mt-6 flex w-full items-center justify-center rounded-full gradient-primary px-5 py-3 font-semibold text-white shadow-soft"
            >
              View Menu
            </Link>
          </aside>
        </div>
      )}
    </header>
  );
}
