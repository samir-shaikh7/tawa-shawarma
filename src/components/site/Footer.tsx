import { Instagram, Facebook } from "lucide-react";
import { useSettings } from "@/lib/settings";

export function Footer() {
  const { settings } = useSettings();

  return (
    <footer className="bg-dark-section pt-10 pb-16 md:pt-16 md:pb-16">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 overflow-hidden rounded-xl shadow-soft">
              <img src="/logo.png" alt={`${settings.name} Logo`} className="h-full w-full object-cover" width={48} height={48} />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-white">{settings.name}</span>
          </div>
          <p className="mt-4 text-sm text-white/65">
            {settings.tagline || `Serving fresh shawarma, burgers, sandwiches, pizza and snacks in Nanded. Always fresh, always delicious.`}
          </p>
          <div className="mt-5 flex gap-3">
            {[
              { Icon: Facebook, href: settings.facebook || "https://facebook.com" },
              { Icon: Instagram, href: settings.instagram || "https://instagram.com" },
            ].map(({ Icon, href }, i) => (
              <a
                key={i}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full glass-dark transition-all duration-300 hover:gradient-primary hover:text-white hover:scale-110 active:scale-95"
                aria-label={i === 0 ? "Facebook" : "Instagram"}
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-widest text-amber">Quick Links</h4>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            {[
              { label: "Home", href: "/" },
              { label: "Menu", href: "/#menu" },
              { label: "Track Order", href: "/track" },
              { label: "Gallery", href: "/#gallery" },
              { label: "About", href: "/#about" },
              { label: "Reviews", href: "/#reviews" },
              { label: "Contact", href: "/#contact" }
            ].map((l) => (
              <li key={l.label}>
                <a href={l.href} className="hover:text-gold transition-colors">{l.label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-widest text-amber">Our Menu</h4>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            {["Shawarma", "Burgers", "Sandwiches", "Pizza", "Fries"].map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-widest text-amber">Contact</h4>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li>{settings.address}</li>
            <li>{settings.phone}</li>
            <li>{settings.email}</li>
            <li>{settings.opening_hours}</li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-7xl border-t border-white/10 px-4 pt-6 text-center text-xs text-white/50">
        © {new Date().getFullYear()} {settings.name}. All Rights Reserved
      </div>
    </footer>
  );
}
