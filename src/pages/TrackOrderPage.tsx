import { useState, useEffect } from "react";
import { Search, Loader2, ArrowLeft, Package, Clock, Utensils, CheckCircle2, XCircle, ClipboardCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase, OrderStatus } from "@/lib/supabase";
import { formatPrice } from "@/lib/utils";

const STATUS_STEPS = ["Pending", "Confirmed", "Preparing", "Ready", "Delivered"];

const STATUS_ICONS: Record<string, React.ReactNode> = {
  Pending: <Clock className="h-5 w-5" />,
  Confirmed: <ClipboardCheck className="h-5 w-5" />,
  Preparing: <Utensils className="h-5 w-5" />,
  Ready: <Package className="h-5 w-5" />,
  Delivered: <CheckCircle2 className="h-5 w-5" />,
  Cancelled: <XCircle className="h-5 w-5 text-red-500" />
};

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('order_number', orderNumber.trim())
        .eq('phone', phone.trim())
        .single();

      if (fetchError || !data) {
        throw new Error("Order not found.");
      }

      setOrder(data);
    } catch (err: any) {
      setError(err.message || "Could not track order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const currentStatusIndex = STATUS_STEPS.indexOf(order?.status);

  return (
    <div className="bg-atmosphere min-h-screen text-foreground pt-24 pb-32">
      <div className="mx-auto max-w-xl px-4">
        <div className="mb-8 flex items-center gap-4">
          <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-soft transition hover:text-amber">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-3xl font-bold">Track Order</h1>
        </div>

        {!order ? (
          <form onSubmit={handleTrack} className="rounded-3xl bg-white p-6 shadow-card space-y-6">
            <p className="text-foreground/70 text-sm">Enter your order number and phone number to track your food.</p>
            
            {error && <div className="p-3 text-sm text-red-500 bg-red-50 rounded-xl">{error}</div>}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Order Number</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. TS-1001"
                  className="w-full rounded-xl border border-black/10 bg-atmosphere/50 p-3 text-sm outline-none uppercase focus:border-amber/50 focus:ring-2 focus:ring-amber/20"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Phone Number</label>
                <input
                  required
                  type="tel"
                  placeholder="9876543210"
                  className="w-full rounded-xl border border-black/10 bg-atmosphere/50 p-3 text-sm outline-none focus:border-amber/50 focus:ring-2 focus:ring-amber/20"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full gradient-primary py-3.5 text-sm font-bold text-white shadow-soft transition hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:scale-100"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Search className="h-4 w-4" /> Track Now</>}
            </button>
          </form>
        ) : (
          <div className="space-y-6 animate-fade-up">
            <div className="rounded-3xl bg-white p-6 shadow-card">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-widest text-foreground/50">Order</div>
                  <div className="text-2xl font-black text-amber">{order.order_number}</div>
                </div>
                <button 
                  onClick={() => setOrder(null)}
                  className="text-xs font-bold bg-atmosphere px-3 py-1.5 rounded-full hover:bg-gold/20 transition"
                >
                  Track Another
                </button>
              </div>

              {order.status === "Cancelled" ? (
                <div className="flex flex-col items-center justify-center p-6 bg-red-50 rounded-2xl text-red-500 text-center mb-8">
                  <XCircle className="h-10 w-10 mb-2" />
                  <div className="font-bold text-lg">Order Cancelled</div>
                  <div className="text-sm opacity-80 mt-1">This order was cancelled by the restaurant.</div>
                </div>
              ) : (
                <div className="relative mb-8 pt-4">
                  <div className="absolute left-0 top-8 w-full h-1 bg-atmosphere rounded-full">
                    <div 
                      className="h-full gradient-primary rounded-full transition-all duration-700"
                      style={{ width: `${(Math.max(0, currentStatusIndex) / (STATUS_STEPS.length - 1)) * 100}%` }}
                    />
                  </div>
                  
                  <div className="relative flex justify-between">
                    {STATUS_STEPS.map((step, idx) => {
                      const isCompleted = idx <= currentStatusIndex;
                      const isCurrent = idx === currentStatusIndex;
                      return (
                        <div key={step} className="flex flex-col items-center gap-2">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-500 z-10 bg-white ${isCompleted ? 'border-amber text-amber shadow-glow' : 'border-black/10 text-foreground/30'}`}>
                            {STATUS_ICONS[step]}
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${isCurrent ? 'text-amber' : isCompleted ? 'text-foreground' : 'text-foreground/40'}`}>
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-4 border-t border-black/5 pt-6">
                <h3 className="font-bold">Order Details</h3>
                <div className="space-y-3">
                  {order.order_items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <div className="flex gap-2">
                        <span className="font-semibold text-foreground/50">{item.quantity}x</span>
                        <span>{item.product_name} <span className="text-foreground/50">({item.variant_name})</span></span>
                      </div>
                      <span className="font-semibold">₹{item.total_price}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between border-t border-black/5 pt-4 font-bold text-lg">
                  <span>Total</span>
                  <span className="text-amber">₹{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
            
            <div className="rounded-3xl bg-white p-6 shadow-card space-y-2">
              <h3 className="font-bold text-sm mb-3">Delivery Information</h3>
              <div className="text-sm">
                <span className="font-semibold text-foreground/60 mr-2">Name:</span> 
                {order.customer_name}
              </div>
              <div className="text-sm">
                <span className="font-semibold text-foreground/60 mr-2">Phone:</span> 
                {order.phone}
              </div>
              <div className="text-sm">
                <span className="font-semibold text-foreground/60 mr-2">Address:</span> 
                {order.address}
                {order.landmark && <><br/><span className="font-semibold text-foreground/60 mr-2">Landmark:</span> {order.landmark}</>}
                {order.notes && <><br/><span className="font-semibold text-foreground/60 mr-2">Notes:</span> {order.notes}</>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
