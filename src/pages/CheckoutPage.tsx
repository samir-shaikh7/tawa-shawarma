import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Loader2, MapPin } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { Turnstile } from '@marsidev/react-turnstile';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart, totalItems } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    landmark: "",
    notes: "",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    if (items.length === 0) {
      navigate("/cart");
    }
  }, [items, navigate]);

  const handleLiveLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data && data.display_name) {
            setFormData(prev => ({ ...prev, address: data.display_name }));
          } else {
            alert("Could not fetch address. Please enter manually.");
          }
        } catch (err) {
          alert("Could not fetch address. Please enter manually.");
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        alert("Location access denied or unavailable.");
        setIsLocating(false);
      },
      { timeout: 10000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    if (totalItems < 2) {
      setError("Minimum order quantity is 2 items.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const sanitizedName = formData.name.trim();
      const sanitizedPhone = formData.phone.trim();
      const sanitizedAddress = formData.address.trim();
      const sanitizedLandmark = formData.landmark.trim();
      const sanitizedNotes = formData.notes.trim();

      if (!sanitizedName || sanitizedName.length > 100) {
        throw new Error("Please enter a valid name (max 100 characters).");
      }
      if (!sanitizedPhone || sanitizedPhone.length > 20) {
        throw new Error("Please enter a valid phone number (max 20 characters).");
      }
      if (!sanitizedAddress || sanitizedAddress.length > 500) {
        throw new Error("Please enter a valid address (max 500 characters).");
      }
      if (sanitizedLandmark.length > 200) {
        throw new Error("Landmark is too long (max 200 characters).");
      }
      if (sanitizedNotes.length > 500) {
        throw new Error("Special instructions are too long (max 500 characters).");
      }

      const isDev = import.meta.env.DEV;

      if (!turnstileToken && !isDev) {
        throw new Error("Please complete the security check.");
      }

      const tokenToSend = turnstileToken || (isDev ? "dev_bypass" : "");

      const { data, error: functionError } = await supabase.functions.invoke('checkout', {
        body: {
          turnstileToken: tokenToSend,
          order: {
            customer_name: sanitizedName,
            phone: sanitizedPhone,
            address: sanitizedAddress,
            landmark: sanitizedLandmark || null,
            notes: sanitizedNotes || null,
            subtotal: totalPrice,
            delivery_charge: 0,
            total: totalPrice,
            payment_method: "Cash on Delivery",
            status: "Pending"
          },
          items: items.map(item => ({
            product_name: item.name,
            variant_name: item.variant,
            quantity: item.quantity,
            unit_price: item.price,
            total_price: item.price * item.quantity
          }))
        }
      });

      if (functionError) throw functionError;
      if (data?.error) throw new Error(data.error);

      // 3. Telegram Notification is now securely handled by a Supabase Database Webhook / Edge Function

      navigate(`/order-success/${data.order.id}`);
    } catch (err: any) {
      console.error("Order submission failed", err);
      setError(err.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) return null;

  const isDev = import.meta.env.DEV;

  return (
    <div className="bg-atmosphere min-h-screen text-foreground pt-24 pb-32">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 flex items-center gap-4">
          <Link to="/cart" className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-soft transition hover:text-amber">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-3xl font-bold">Complete your Order</h1>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_400px] items-start">
          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 md:p-8 shadow-card relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary text-white font-bold shadow-soft">1</div>
                <h2 className="text-xl font-bold">Personal Details</h2>
              </div>

              {error && <div className="mb-6 p-3 text-sm text-red-500 bg-red-50 rounded-xl">{error}</div>}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-foreground/50 mb-2">Full Name</label>
                  <input
                    required
                    type="text"
                    placeholder="Enter your name"
                    className="w-full rounded-2xl bg-atmosphere/50 px-4 py-3.5 text-sm font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-amber/40 transition-all border border-transparent focus:border-amber/20"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-foreground/50 mb-2">Phone Number</label>
                  <input
                    required
                    type="tel"
                    placeholder="e.g. 9876543210"
                    className="w-full rounded-2xl bg-atmosphere/50 px-4 py-3.5 text-sm font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-amber/40 transition-all border border-transparent focus:border-amber/20"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 md:p-8 shadow-card relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary text-white font-bold shadow-soft">2</div>
                  <h2 className="text-xl font-bold">Delivery Location</h2>
                </div>
                <button
                  type="button"
                  onClick={handleLiveLocation}
                  disabled={isLocating}
                  className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 transition hover:bg-blue-100 active:scale-95 disabled:opacity-50 disabled:scale-100"
                >
                  {isLocating ? <Loader2 className="h-3 w-3 animate-spin" /> : <MapPin className="h-3 w-3" />}
                  {isLocating ? "Locating..." : "Use Live Location"}
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-foreground/50 mb-2">Complete Address</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Street name, Building, Floor/Unit No."
                    className="w-full rounded-2xl bg-atmosphere/50 px-4 py-3.5 text-sm font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-amber/40 transition-all border border-transparent focus:border-amber/20 resize-none"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-foreground/50 mb-2">Landmark (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Near Blue Gate"
                      className="w-full rounded-2xl bg-atmosphere/50 px-4 py-3.5 text-sm font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-amber/40 transition-all border border-transparent focus:border-amber/20"
                      value={formData.landmark}
                      onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-foreground/50 mb-2">Special Instructions</label>
                    <input
                      type="text"
                      placeholder="e.g. Extra sauce, no onions"
                      className="w-full rounded-2xl bg-atmosphere/50 px-4 py-3.5 text-sm font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-amber/40 transition-all border border-transparent focus:border-amber/20"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 md:p-8 shadow-card relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary text-white font-bold shadow-soft">3</div>
                <h2 className="text-xl font-bold">Select Payment Method</h2>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                <div className="rounded-2xl border-2 border-amber bg-gold/5 p-4 text-center cursor-pointer relative overflow-hidden shadow-soft">
                  <div className="absolute top-3 right-3 h-3 w-3 rounded-full gradient-primary shadow-sm" />
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full gradient-primary text-white shadow-sm">
                    <span className="font-bold text-lg">₹</span>
                  </div>
                  <div className="font-bold text-sm">Cash on Delivery</div>
                  <div className="text-[10px] uppercase tracking-widest text-foreground/50 mt-1">Safe & Simple</div>
                </div>
              </div>
            </div>
          </div>

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

            <div className="mb-6 flex justify-center">
              {siteKey ? (
                <Turnstile siteKey={siteKey} onSuccess={setTurnstileToken} />
              ) : isDev ? null : (
                <div className="p-3 bg-red-50 text-red-500 rounded-xl text-xs text-center border border-red-100">
                  ⚠️ System Error: Turnstile Site Key missing from .env
                </div>
              )}
            </div>

            {totalItems < 2 && (
              <div className="mb-4 rounded-xl bg-red-50 p-3 text-center text-xs font-semibold text-red-500 border border-red-100">
                Minimum order quantity is 2 items.
              </div>
            )}

            <button
              type="submit"
              disabled={loading || totalItems < 2}
              className={`flex w-full items-center justify-center gap-2 rounded-full py-4 text-lg font-bold text-white shadow-elegant transition ${loading || totalItems < 2
                ? "bg-gray-300 cursor-not-allowed opacity-70"
                : "gradient-primary hover:scale-[1.02] active:scale-95"
                }`}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Place Order"}
            </button>

            <div className="mt-4 text-center text-[10px] font-bold uppercase tracking-widest text-foreground/40">
              Secure Checkout
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
