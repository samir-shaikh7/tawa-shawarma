import { useMemo } from "react";
import { MessageCircle, Phone, MapPin, ShoppingBag } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import { useSettings } from "@/lib/settings";

export function FloatingButtons() {
  const { settings } = useSettings();
  const { totalItems } = useCart();
  const location = useLocation();

  const hidePaths = ["/cart", "/checkout", "/order-success"];
  const isCartVisible = totalItems > 0 && !hidePaths.some(path => location.pathname.startsWith(path));

  return (
    <div className={`fixed right-4 z-[60] flex flex-col gap-3 transition-all duration-300 [will-change:transform] [transform:translateZ(0)] ${isCartVisible ? 'bottom-[90px] md:bottom-[100px]' : 'bottom-5 md:bottom-6'}`}>
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

export function FloatingCartBanner() {
  const { totalItems, totalPrice } = useCart();
  const location = useLocation();

  // Hide on cart, checkout, order success pages
  const hidePaths = ["/cart", "/checkout", "/order-success"];
  const shouldHide = hidePaths.some(path => location.pathname.startsWith(path));

  if (totalItems === 0 || shouldHide) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-[60] w-[92%] max-w-md -translate-x-1/2 [will-change:transform] [transform:translateZ(0)] md:w-[400px] md:bottom-8">
      <Link
        to="/cart"
        className="flex items-center justify-between overflow-hidden rounded-full gradient-primary px-6 py-4 text-white shadow-elegant transition-transform hover:scale-[1.02] active:scale-[0.98]"
      >
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-2 font-bold text-sm sm:text-base">
            <span>{totalItems} {totalItems === 1 ? "item" : "items"}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-white/50" />
            <span>₹ {formatPrice(totalPrice)}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-sm font-bold sm:text-base">
          View Cart <span className="text-lg leading-none">→</span>
        </div>
      </Link>
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
