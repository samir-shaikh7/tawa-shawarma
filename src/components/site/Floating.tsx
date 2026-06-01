import { useMemo } from "react";
import { MessageCircle, Phone, MapPin, Home, UtensilsCrossed, ShoppingBag } from "lucide-react";
import { useSettings } from "@/lib/settings";

export function FloatingButtons() {
  const { settings } = useSettings();

  return (
    <div className="fixed bottom-5 right-4 z-[60] flex flex-col gap-3 md:bottom-6 [will-change:transform] [transform:translateZ(0)]">
      <a
        href={`https://wa.me/${settings.whatsapp.replace(/\s/g, "")}?text=Hello,%20I%20would%20like%20to%20place%20an%20order`}
        target="_blank"
        rel="noreferrer"
        className="flex h-14 w-14 items-center justify-center rounded-full gradient-primary text-white btn-glow animate-glow transition hover:scale-110"
        aria-label="Order on WhatsApp"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
      <a
        href={`tel:${settings.phone.replace(/\s/g, "")}`}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-amber shadow-pop transition hover:scale-110 hover:text-brown"
        aria-label="Call us"
      >
        <Phone className="h-5 w-5" />
      </a>
      <a
        href="/#contact"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-amber shadow-pop transition hover:scale-110 hover:text-brown"
        aria-label="Find our location"
      >
        <MapPin className="h-5 w-5" />
      </a>
    </div>
  );
}



export function OfferTicker() {
  const items = useMemo(() => {
    const offers = [
      "🌯 Fresh Shawarma Daily",
      "🍔 Burgers & Sandwiches",
      "🍕 Chicken Cheese Pizza",
      "⭐ Premium Quality",
      "🚀 Fast Delivery in Nanded",
      "❤️ Family Friendly",
      "🧑‍🍳 Made with Passion",
      "✅ Affordable Prices",
    ];
    return [...offers, ...offers];
  }, []);

  return (
    <div className="relative overflow-hidden gradient-primary py-2.5 text-white">
      <div className="flex w-max animate-marquee gap-12 whitespace-nowrap text-sm font-semibold [will-change:transform] [transform:translateZ(0)]">
        {items.map((o, i) => (
          <span key={i} className="flex items-center gap-3">
            <span>{o}</span>
            <span className="opacity-60">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}
