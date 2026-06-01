import { Link } from "react-router-dom";
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import { SITE } from "@/lib/menu-data";
import { useEffect } from "react";

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice, clearCart, totalItems } = useCart();
  const whatsappNumber = SITE.contact.whatsapp;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleOrder = () => {
    let orderText = "Hello, I would like to place an order:%0A%0A";
    items.forEach((item) => {
      orderText += `▪ ${item.quantity}x ${item.name} (${item.variant}) - ₹${item.price * item.quantity}%0A`;
    });
    orderText += `%0A*Total: ₹${totalPrice}*`;

    window.open(`https://wa.me/${whatsappNumber}?text=${orderText}`, "_blank");
  };

  return (
    <div className="bg-atmosphere min-h-screen text-foreground pt-24 pb-32">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 flex items-center gap-4">
          <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-soft transition hover:text-amber">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-3xl font-bold">Your Shopping Cart</h1>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white py-20 shadow-card text-center">
            <ShoppingBag className="h-16 w-16 text-foreground/20 mb-4" />
            <h2 className="text-xl font-bold">Cart is empty</h2>
            <p className="mt-2 text-foreground/60 mb-8">Looks like you haven't added anything yet.</p>
            <Link to="/" className="rounded-full gradient-primary px-8 py-3 font-bold text-white shadow-soft transition hover:scale-105">
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_400px] items-start">
            {/* Left Column: Items */}
            <div className="space-y-4">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variant}`} className="relative flex items-center gap-3 sm:gap-4 rounded-3xl bg-white p-3 sm:p-4 shadow-card">
                  <div className="h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 rounded-2xl bg-atmosphere flex items-center justify-center text-2xl sm:text-3xl shadow-inner">
                    🌯
                  </div>
                  <div className="flex flex-1 flex-col justify-center min-w-0 py-1">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg truncate leading-tight">{item.name}</h3>
                        <p className="text-xs sm:text-sm text-foreground/60 truncate mt-0.5">{item.variant}</p>
                      </div>
                      <button 
                        onClick={() => removeItem(item.productId, item.variant)} 
                        className="flex-shrink-0 p-1.5 -mr-1.5 -mt-1.5 text-foreground/30 hover:bg-red-50 hover:text-red-500 rounded-full transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="font-bold text-amber text-sm sm:text-base">₹ {formatPrice(item.price)}</div>
                      <div className="flex items-center gap-1 sm:gap-2 rounded-full bg-atmosphere px-1.5 py-1 border border-black/5">
                        <button 
                          onClick={() => updateQuantity(item.productId, item.variant, -1)} 
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm transition hover:text-amber"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-amber">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.productId, item.variant, 1)} 
                          className="flex h-7 w-7 items-center justify-center rounded-full gradient-primary text-white shadow-sm transition hover:scale-105"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={clearCart}
                className="mt-6 text-xs font-bold uppercase tracking-widest text-foreground/50 hover:text-red-500 transition-colors"
              >
                Clear All Items
              </button>
            </div>

            {/* Right Column: Order Summary */}
            <div className="sticky top-24 rounded-3xl bg-white p-6 shadow-card">
              <h3 className="font-bold text-xl mb-6">Order summary</h3>

              <div className="space-y-3 text-sm border-b border-black/5 pb-4 mb-4">
                <div className="flex justify-between">
                  <span className="text-foreground/60">Subtotal</span>
                  <span className="font-semibold">₹ {formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/60">Delivery</span>
                  <span className="font-semibold">₹ 0</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-lg font-bold mb-6">
                <span>Total</span>
                <span className="text-gradient-primary text-2xl">₹ {formatPrice(totalPrice)}</span>
              </div>

              <div className="mb-6 rounded-xl bg-gold/10 p-3 text-center text-xs font-semibold text-amber">
                No Delivery Charges
              </div>

              {totalItems < 2 && (
                <div className="mb-4 rounded-xl bg-red-50 p-3 text-center text-xs font-semibold text-red-500 border border-red-100">
                  Minimum order quantity is 2 items.
                </div>
              )}

              <Link
                to={totalItems >= 2 ? "/checkout" : "#"}
                onClick={(e) => {
                  if (totalItems < 2) e.preventDefault();
                }}
                className={`flex w-full items-center justify-center gap-2 rounded-full py-4 text-lg font-bold text-white shadow-elegant transition ${totalItems >= 2
                  ? "gradient-primary hover:scale-[1.02] active:scale-95"
                  : "bg-gray-300 cursor-not-allowed opacity-70"
                  }`}
              >
                Checkout Now <ArrowLeft className="h-5 w-5 rotate-180" />
              </Link>

              <div className="mt-4 text-center text-[10px] font-bold uppercase tracking-widest text-foreground/40">
                Secure Ordering
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
