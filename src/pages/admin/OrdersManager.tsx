import { useState, useEffect, useRef } from "react";
import { Search, Loader2, XCircle, Archive, Trash2, RotateCcw, CheckSquare, Square } from "lucide-react";
import { supabase, OrderStatus } from "@/lib/supabase";
import { formatPrice } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  Pending: "bg-gray-100 text-gray-600",
  Confirmed: "bg-blue-100 text-blue-600",
  Preparing: "bg-purple-100 text-purple-600",
  Ready: "bg-amber-100 text-amber-700",
  "Out for Delivery": "bg-indigo-100 text-indigo-700",
  Delivered: "bg-green-100 text-green-600",
  Cancelled: "bg-red-100 text-red-600",
};

export default function OrdersManager() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [newOrderAlert, setNewOrderAlert] = useState<any>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const fetchOrders = async () => {
    setLoading(true);
    try {
      // First attempt with is_deleted filter
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('is_deleted', showArchived)
        .order('created_at', { ascending: false });
        
      if (error && error.code === '42703') {
        // Fallback if the SQL schema is not yet applied
        console.warn("is_deleted column not found, falling back to all orders. Please run the SQL schema.");
        const fallback = await supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
        setOrders(fallback.data || []);
      } else {
        if (error) throw error;
        setOrders(data || []);
      }
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    
    audioRef.current = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
    audioRef.current.loop = true;

    const channel = supabase
      .channel('public:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => {
        if (payload.eventType === 'INSERT') {
          setNewOrderAlert(payload.new);
          if (audioRef.current) {
            audioRef.current.play().catch(e => console.error("Audio play failed:", e));
          }
        }
        fetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [showArchived]);

  const logAction = async (action: string, recordType: string, recordId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        await supabase.from('admin_logs').insert({
          admin_email: user.email,
          action,
          record_type: recordType,
          record_id: recordId
        });
      }
    } catch (e) {
      console.error("Logging failed", e);
    }
  };

  const updateStatus = async (id: string, newStatus: OrderStatus) => {
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      await logAction('UPDATE_STATUS', 'Order', id);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm("Are you sure you want to archive this order?")) return;
    try {
      await supabase.from('orders').update({ is_deleted: true, deleted_at: new Date().toISOString() }).eq('id', id);
      await logAction('ARCHIVE', 'Order', id);
      fetchOrders();
    } catch (err) {
      alert("Failed to archive");
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await supabase.from('orders').update({ is_deleted: false, deleted_at: null }).eq('id', id);
      await logAction('RESTORE', 'Order', id);
      fetchOrders();
    } catch (err) {
      alert("Failed to restore");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("PERMANENT DELETE: Are you sure? This cannot be undone.")) return;
    try {
      await supabase.from('orders').delete().eq('id', id);
      await logAction('PERMANENT_DELETE', 'Order', id);
      fetchOrders();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const handleBulkArchive = async () => {
    if (!selectedIds.length || !confirm(`Archive ${selectedIds.length} selected orders?`)) return;
    try {
      await supabase.from('orders').update({ is_deleted: true, deleted_at: new Date().toISOString() }).in('id', selectedIds);
      await Promise.all(selectedIds.map(id => logAction('BULK_ARCHIVE', 'Order', id)));
      setSelectedIds([]);
      fetchOrders();
    } catch (err) {
      alert("Failed to bulk archive");
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length || !confirm(`PERMANENT DELETE ${selectedIds.length} selected orders?`)) return;
    try {
      await supabase.from('orders').delete().in('id', selectedIds);
      await Promise.all(selectedIds.map(id => logAction('BULK_PERMANENT_DELETE', 'Order', id)));
      setSelectedIds([]);
      fetchOrders();
    } catch (err) {
      alert("Failed to bulk delete");
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const filteredOrders = orders.filter(o => 
    o.order_number.toLowerCase().includes(search.toLowerCase()) || 
    o.customer_name.toLowerCase().includes(search.toLowerCase())
  );

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const preparingOrders = orders.filter(o => o.status === 'Preparing').length;
  const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-3xl shadow-card text-center">
          <div className="text-3xl font-black text-amber">{totalOrders}</div>
          <div className="text-xs font-bold uppercase tracking-widest text-foreground/50 mt-1">{showArchived ? 'Archived Orders' : 'Active Orders'}</div>
        </div>
        <div className="bg-white p-4 rounded-3xl shadow-card text-center">
          <div className="text-3xl font-black text-blue-500">{pendingOrders}</div>
          <div className="text-xs font-bold uppercase tracking-widest text-foreground/50 mt-1">Pending</div>
        </div>
        <div className="bg-white p-4 rounded-3xl shadow-card text-center">
          <div className="text-3xl font-black text-purple-500">{preparingOrders}</div>
          <div className="text-xs font-bold uppercase tracking-widest text-foreground/50 mt-1">Preparing</div>
        </div>
        <div className="bg-white p-4 rounded-3xl shadow-card text-center">
          <div className="text-3xl font-black text-green-500">{deliveredOrders}</div>
          <div className="text-xs font-bold uppercase tracking-widest text-foreground/50 mt-1">Delivered</div>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-card mb-8">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/45" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order number or name..."
              className="w-full rounded-xl bg-atmosphere/50 py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-amber/40"
            />
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            <button 
              onClick={() => setShowArchived(!showArchived)}
              className={`px-4 py-2 rounded-xl text-sm font-bold border transition ${showArchived ? 'bg-amber text-white border-amber' : 'bg-white border-black/10 text-foreground/70 hover:bg-atmosphere'}`}
            >
              {showArchived ? 'View Active Orders' : 'View Archived'}
            </button>
            
            {selectedIds.length > 0 && (
              <>
                {!showArchived && (
                  <button onClick={handleBulkArchive} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-orange-100 text-orange-700 hover:bg-orange-200 transition">
                    <Archive className="h-4 w-4" /> Bulk Archive
                  </button>
                )}
                <button onClick={handleBulkDelete} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-red-100 text-red-700 hover:bg-red-200 transition">
                  <Trash2 className="h-4 w-4" /> Bulk Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-amber" />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-10 text-foreground/50">No orders found.</div>
          ) : (
            filteredOrders.map(order => (
              <div key={order.id} className={`rounded-3xl bg-white p-5 shadow-card flex flex-col md:flex-row gap-6 transition ${selectedIds.includes(order.id) ? 'ring-2 ring-amber' : ''}`}>
                <div className="flex items-start pt-2">
                  <button onClick={() => toggleSelection(order.id)} className="text-foreground/30 hover:text-amber">
                    {selectedIds.includes(order.id) ? <CheckSquare className="h-6 w-6 text-amber" /> : <Square className="h-6 w-6" />}
                  </button>
                </div>
                
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-black text-xl text-amber">{order.order_number}</div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm border-t border-b border-black/5 py-3">
                    <div>
                      <div className="text-foreground/50 text-xs uppercase">Customer</div>
                      <div className="font-semibold">{order.customer_name}</div>
                      <div className="text-foreground/70">{order.phone}</div>
                    </div>
                    <div>
                      <div className="text-foreground/50 text-xs uppercase">Time</div>
                      <div className="font-semibold">{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      <div className="text-foreground/70">{new Date(order.created_at).toLocaleDateString()}</div>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <div className="text-foreground/50 text-xs uppercase">Total</div>
                      <div className="font-bold text-amber text-lg">₹{formatPrice(order.total)}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <button 
                      onClick={() => setSelectedOrder(order)} 
                      className="text-sm bg-atmosphere px-4 py-2 rounded-full font-bold hover:bg-gold/20 transition text-amber"
                    >
                      View Details
                    </button>
                    {!showArchived ? (
                      <button 
                        onClick={() => handleArchive(order.id)} 
                        className="flex items-center gap-1.5 text-sm bg-orange-50 text-orange-600 px-4 py-2 rounded-full font-bold hover:bg-orange-100 transition"
                      >
                        <Archive className="h-4 w-4" /> Archive
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleRestore(order.id)} 
                        className="flex items-center gap-1.5 text-sm bg-blue-50 text-blue-600 px-4 py-2 rounded-full font-bold hover:bg-blue-100 transition"
                      >
                        <RotateCcw className="h-4 w-4" /> Restore
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(order.id)} 
                      className="flex items-center gap-1.5 text-sm bg-red-50 text-red-600 px-4 py-2 rounded-full font-bold hover:bg-red-100 transition"
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  </div>
                </div>

                <div className="md:w-48 flex flex-col gap-2 justify-center border-t md:border-t-0 md:border-l border-black/5 pt-4 md:pt-0 md:pl-6">
                  <div className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-1 text-center md:text-left">Change Status</div>
                  <select 
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                    className="w-full rounded-xl bg-atmosphere p-3 text-sm font-semibold outline-none border border-black/5"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Ready">Ready</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {newOrderAlert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border-4 border-amber animate-pulse">
            <div className="bg-amber/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <span className="text-4xl">🔔</span>
            </div>
            <h2 className="text-2xl font-black mb-2">New Order Received!</h2>
            <div className="text-amber font-bold text-xl mb-6">{newOrderAlert.order_number}</div>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current.currentTime = 0;
                  }
                  const fullOrder = orders.find(o => o.id === newOrderAlert.id) || newOrderAlert;
                  setSelectedOrder(fullOrder);
                  setNewOrderAlert(null);
                }}
                className="w-full gradient-primary text-white font-bold py-4 rounded-full shadow-lg hover:scale-[1.02] active:scale-95 transition"
              >
                View Order
              </button>
              <button 
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current.currentTime = 0;
                  }
                  setNewOrderAlert(null);
                }}
                className="w-full bg-atmosphere text-foreground font-bold py-3 rounded-full hover:bg-black/5 transition"
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 shadow-2xl relative">
            <button onClick={() => setSelectedOrder(null)} className="absolute top-6 right-6 text-foreground/50 hover:text-black">
              <XCircle className="h-6 w-6" />
            </button>
            
            <div id="print-area">
              <div className="mb-6 border-b border-black/10 pb-4 pr-10">
                <h2 className="text-2xl font-black text-amber">Order {selectedOrder.order_number}</h2>
                <div className="text-sm font-semibold text-foreground/60">{new Date(selectedOrder.created_at).toLocaleString()}</div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-2">Customer Info</h3>
                  <div className="font-semibold">{selectedOrder.customer_name}</div>
                  <div className="text-foreground/70">{selectedOrder.phone}</div>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-2">Delivery Address</h3>
                  <div className="font-semibold">{selectedOrder.address}</div>
                  {selectedOrder.landmark && <div className="text-sm mt-1"><span className="font-semibold text-foreground/60">Landmark:</span> {selectedOrder.landmark}</div>}
                  {selectedOrder.notes && <div className="text-sm mt-1"><span className="font-semibold text-foreground/60">Notes:</span> {selectedOrder.notes}</div>}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-2">Items Ordered</h3>
                <div className="space-y-2">
                  {selectedOrder.order_items?.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center bg-atmosphere/50 p-3 rounded-xl">
                      <div>
                        <span className="font-bold mr-2">{item.quantity}x</span>
                        <span className="font-semibold">{item.product_name}</span>
                        <span className="text-sm text-foreground/60 ml-1">({item.variant_name})</span>
                      </div>
                      <div className="font-bold">₹{item.total_price}</div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-black/10 text-lg">
                  <span className="font-bold">Total Amount</span>
                  <span className="font-black text-amber text-2xl">₹{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 border-t border-black/10 pt-6">
              <button onClick={() => {
                const printContents = document.getElementById('print-area')?.innerHTML;
                const printWindow = window.open('', '', 'height=600,width=800');
                if (printWindow) {
                  printWindow.document.write(`
                    <html>
                      <head>
                        <title>Print Order ${selectedOrder.order_number}</title>
                        <style>
                          body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; color: #333; }
                          h2 { margin-top: 0; color: #000; }
                          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
                          .items { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                          .items th, .items td { text-align: left; padding: 8px; border-bottom: 1px solid #ddd; }
                          .total { font-size: 1.5em; font-weight: bold; text-align: right; }
                          .meta { font-size: 0.8em; color: #666; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
                          .section-title { font-size: 0.8em; text-transform: uppercase; color: #666; font-weight: bold; margin-bottom: 5px; }
                        </style>
                      </head>
                      <body>
                        <h2>Order ${selectedOrder.order_number}</h2>
                        <div class="meta">${new Date(selectedOrder.created_at).toLocaleString()}</div>
                        
                        <div class="grid">
                          <div>
                            <div class="section-title">Customer</div>
                            <div><strong>${selectedOrder.customer_name}</strong></div>
                            <div>${selectedOrder.phone}</div>
                          </div>
                          <div>
                            <div class="section-title">Delivery Address</div>
                            <div>${selectedOrder.address}</div>
                            ${selectedOrder.landmark ? `<div>Landmark: ${selectedOrder.landmark}</div>` : ''}
                            ${selectedOrder.notes ? `<div>Notes: ${selectedOrder.notes}</div>` : ''}
                          </div>
                        </div>

                        <div class="section-title">Items</div>
                        <table class="items">
                          ${selectedOrder.order_items?.map((item: any) => `
                            <tr>
                              <td><strong>${item.quantity}x</strong> ${item.product_name} <small>(${item.variant_name})</small></td>
                              <td style="text-align: right;">Rs. ${item.total_price}</td>
                            </tr>
                          `).join('')}
                        </table>
                        
                        <div class="total">Total: Rs. ${selectedOrder.total}</div>
                      </body>
                    </html>
                  `);
                  printWindow.document.close();
                  printWindow.focus();
                  setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
                }
              }} className="flex-1 bg-atmosphere text-foreground font-bold py-3 rounded-full hover:bg-gold/20 transition text-center border border-black/5">
                Print Order
              </button>
              <div className="flex-1 relative">
                <select 
                  value={selectedOrder.status}
                  onChange={(e) => {
                    updateStatus(selectedOrder.id, e.target.value as OrderStatus);
                    setSelectedOrder({...selectedOrder, status: e.target.value});
                  }}
                  className="w-full h-full appearance-none rounded-full gradient-primary text-white font-bold px-4 py-3 text-center cursor-pointer outline-none shadow-soft"
                >
                  <option value="Pending" className="text-black">Pending</option>
                  <option value="Confirmed" className="text-black">Confirmed</option>
                  <option value="Preparing" className="text-black">Preparing</option>
                  <option value="Ready" className="text-black">Ready</option>
                  <option value="Out for Delivery" className="text-black">Out for Delivery</option>
                  <option value="Delivered" className="text-black">Delivered</option>
                  <option value="Cancelled" className="text-black">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
