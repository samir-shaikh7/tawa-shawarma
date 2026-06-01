import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2, ChevronRight, Loader2, Receipt, Download } from "lucide-react";
import { useCart } from "@/lib/cart";
import { supabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/utils";
import { jsPDF } from "jspdf";

export default function OrderSuccessPage() {
  const { id } = useParams();
  const { clearCart } = useCart();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const hasCleared = useRef(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Safely clear the cart only once
    if (!hasCleared.current) {
      clearCart();
      hasCleared.current = true;
    }

    const fetchOrder = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('id', id)
          .single();
          
        if (data && !error) {
          setOrder(data);
        }
      } catch (err) {
        console.error("Error fetching order", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    } else {
      setLoading(false);
    }
  }, [id]);

  return (
    <div className="bg-atmosphere min-h-screen text-foreground pt-24 pb-32 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-card">
            <Loader2 className="h-10 w-10 animate-spin text-amber mb-4" />
            <p className="text-foreground/50 font-bold tracking-widest uppercase text-sm">Loading Order Details...</p>
          </div>
        ) : !order ? (
          <div className="bg-white rounded-3xl p-8 shadow-card text-center">
            <h1 className="text-2xl font-black mb-4">Order Not Found</h1>
            <p className="mb-8 text-foreground/60">We couldn't find details for this order. It may have been placed successfully but is taking a moment to sync.</p>
            <Link to="/" className="inline-flex items-center gap-2 rounded-full gradient-primary px-8 py-3.5 text-sm font-bold text-white shadow-soft transition hover:scale-[1.02]">
              Back to Home
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-8 shadow-card text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-2 gradient-primary" />
              
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-green-500 animate-fade-up">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              
              <h1 className="text-3xl font-black mb-2 animate-fade-up" style={{animationDelay: '100ms'}}>Order Confirmed!</h1>
              <p className="text-foreground/60 mb-6 animate-fade-up" style={{animationDelay: '200ms'}}>
                Thank you for your order. Your order has been received successfully and is being processed.
              </p>

              <div className="grid sm:grid-cols-3 gap-4 mb-8 animate-fade-up" style={{animationDelay: '300ms'}}>
                <div className="bg-atmosphere/50 rounded-2xl p-4 border border-black/5 flex flex-col justify-center">
                  <div className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-1">Order Number</div>
                  <div className="text-2xl font-black text-amber">{order.order_number}</div>
                </div>
                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 flex flex-col justify-center">
                  <div className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-1">Order Status</div>
                  <div className="text-2xl font-black text-blue-600">{order.status}</div>
                </div>
                <div className="rounded-2xl bg-gold/10 p-4 border border-amber/20 flex flex-col justify-center">
                  <div className="text-xs font-bold uppercase tracking-widest text-amber mb-1">Estimated Time</div>
                  <div className="text-lg font-bold">20-30 Minutes</div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-8 shadow-card relative animate-fade-up" style={{animationDelay: '400ms'}}>
              <div className="flex items-center justify-between gap-3 mb-6 pb-6 border-b border-black/10">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary text-white shadow-soft">
                    <Receipt className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black">Professional Receipt</h2>
                    <div className="text-xs font-bold uppercase tracking-widest text-foreground/50">Order Summary</div>
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    const doc = new jsPDF({
                      orientation: "portrait",
                      unit: "mm",
                      format: [80, 200]
                    });

                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(16);
                    doc.text("TAWA SHAWARMA", 40, 15, { align: "center" });

                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(10);
                    doc.text("Professional Receipt", 40, 22, { align: "center" });
                    
                    doc.line(5, 27, 75, 27); 

                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(12);
                    doc.text(`Order: ${order.order_number}`, 5, 35);
                    
                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(9);
                    doc.text(`Date: ${new Date(order.created_at).toLocaleString()}`, 5, 42);

                    doc.line(5, 47, 75, 47);
                    
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(10);
                    doc.text("CUSTOMER DETAILS", 5, 55);
                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(9);
                    doc.text(`Name: ${order.customer_name}`, 5, 62);
                    doc.text(`Phone: ${order.phone}`, 5, 68);

                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(10);
                    doc.text("DELIVERY ADDRESS", 5, 78);
                    
                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(9);
                    
                    const splitAddress = doc.splitTextToSize(order.address || "", 70);
                    doc.text(splitAddress, 5, 85);
                    
                    let currentY = 85 + (splitAddress.length * 5);
                    
                    if (order.landmark) {
                      doc.text(`Landmark: ${order.landmark}`, 5, currentY);
                      currentY += 6;
                    }
                    if (order.notes) {
                      doc.text(`Notes: ${order.notes}`, 5, currentY);
                      currentY += 6;
                    }

                    currentY += 2;
                    doc.line(5, currentY, 75, currentY);
                    currentY += 8;

                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(10);
                    doc.text("ORDER ITEMS", 5, currentY);
                    currentY += 8;
                    
                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(9);

                    order.order_items?.forEach((item: any) => {
                      doc.setFont("helvetica", "bold");
                      const itemName = `${item.quantity}x ${item.product_name}`;
                      const splitName = doc.splitTextToSize(itemName, 50);
                      doc.text(splitName, 5, currentY);
                      
                      doc.text(`Rs. ${item.total_price}`, 75, currentY, { align: "right" });
                      
                      currentY += (splitName.length * 5);
                      
                      doc.setFont("helvetica", "normal");
                      doc.setFontSize(8);
                      doc.setTextColor(100);
                      doc.text(`(${item.variant_name})`, 10, currentY);
                      doc.setTextColor(0);
                      doc.setFontSize(9);
                      
                      currentY += 7;
                    });

                    doc.line(5, currentY, 75, currentY);
                    currentY += 8;

                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(12);
                    doc.text("TOTAL AMOUNT", 5, currentY);
                    doc.text(`Rs. ${order.total}`, 75, currentY, { align: "right" });

                    currentY += 15;
                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(9);
                    doc.text("Thank you for ordering with us!", 40, currentY, { align: "center" });
                    currentY += 5;
                    doc.text("Your food is being prepared.", 40, currentY, { align: "center" });

                    doc.save(`Receipt_${order.order_number}.pdf`);
                  }}
                  className="flex items-center gap-2 bg-amber/10 text-amber px-4 py-2 rounded-full font-bold text-sm hover:bg-amber hover:text-white transition shadow-sm"
                >
                  <Download className="h-4 w-4" /> Download
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-3">Customer Details</h3>
                  <div className="space-y-3 text-sm">
                    <div><span className="font-semibold text-foreground/50 mr-2 w-16 inline-block">Name:</span> <span className="font-bold">{order.customer_name}</span></div>
                    <div><span className="font-semibold text-foreground/50 mr-2 w-16 inline-block">Phone:</span> <span className="font-bold">{order.phone}</span></div>
                    <div><span className="font-semibold text-foreground/50 mr-2 w-16 inline-block">Time:</span> <span className="font-bold">{new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-3">Delivery Address</h3>
                  <div className="text-sm font-bold bg-atmosphere/50 p-4 rounded-2xl border border-black/5">
                    {order.address}
                    {order.landmark && <div className="mt-2 text-foreground/70"><span className="text-foreground/50">Landmark:</span> {order.landmark}</div>}
                    {order.notes && <div className="mt-2 text-amber"><span className="text-amber/50">Notes:</span> {order.notes}</div>}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-3">Ordered Items</h3>
                <div className="space-y-2 mb-6">
                  {order.order_items?.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center bg-atmosphere/30 p-3 rounded-xl text-sm">
                      <div className="flex items-center gap-3">
                        <div className="font-black bg-white w-8 h-8 flex items-center justify-center rounded-full shadow-sm text-amber">{item.quantity}x</div>
                        <div>
                          <div className="font-bold">{item.product_name}</div>
                          <div className="text-xs font-semibold text-foreground/50">{item.variant_name}</div>
                        </div>
                      </div>
                      <div className="font-bold">₹{item.total_price}</div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t-2 border-dashed border-black/10 text-xl">
                  <span className="font-black uppercase tracking-widest text-foreground/50 text-sm">Total Amount</span>
                  <span className="font-black text-amber text-2xl">₹{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 animate-fade-up" style={{animationDelay: '500ms'}}>
              <Link 
                to="/track"
                className="flex w-full items-center justify-center gap-2 rounded-full gradient-primary py-4 text-sm font-bold text-white shadow-soft transition hover:scale-[1.02] active:scale-95"
              >
                Track Order <ChevronRight className="h-4 w-4" />
              </Link>
              <Link 
                to="/"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-white border border-black/10 py-4 text-sm font-bold shadow-sm transition hover:bg-atmosphere active:scale-95"
              >
                Back to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
