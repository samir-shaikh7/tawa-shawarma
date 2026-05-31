import { useState, useEffect } from "react";
import { Loader2, Search, ArrowUpDown, ArrowUp, ArrowDown, Archive, Trash2, RotateCcw, CheckSquare, Square } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/utils";

export default function CustomersManager() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [selectedPhones, setSelectedPhones] = useState<string[]>([]);
  
  // Sorting state
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'last_order_date', direction: 'desc' });

  useEffect(() => {
    fetchCustomers();
  }, [showArchived]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customers_view')
        .select('*')
        .eq('is_deleted', showArchived);
        
      if (error && error.code === '42703') {
        console.warn("is_deleted column not found in customers_view, falling back. Please run the SQL schema.");
        const fallback = await supabase.from('customers_view').select('*');
        setCustomers(fallback.data || []);
      } else {
        if (error) throw error;
        setCustomers(data || []);
      }
    } catch (err: any) {
      console.error("Failed to load customers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

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

  const updateCustomerStatus = async (phone: string, is_deleted: boolean) => {
    try {
      const { error } = await supabase.from('customer_status').upsert({ 
        phone, 
        is_deleted, 
        deleted_at: is_deleted ? new Date().toISOString() : null 
      }, { onConflict: 'phone' });
      
      if (error) {
        // If table doesn't exist, log warning
        if (error.code === '42P01') {
          alert("The customer_status table does not exist. Please run the provided SQL script.");
          return;
        }
        throw error;
      }
      return true;
    } catch (err) {
      console.error(err);
      alert("Failed to update customer status");
      return false;
    }
  };

  const handleArchive = async (phone: string) => {
    if (!confirm("Are you sure you want to archive this customer?")) return;
    const success = await updateCustomerStatus(phone, true);
    if (success) {
      await logAction('ARCHIVE', 'Customer', phone);
      fetchCustomers();
    }
  };

  const handleRestore = async (phone: string) => {
    const success = await updateCustomerStatus(phone, false);
    if (success) {
      await logAction('RESTORE', 'Customer', phone);
      fetchCustomers();
    }
  };

  const handleDelete = async (phone: string) => {
    if (!confirm("PERMANENT DELETE: This will delete ALL orders associated with this phone number. This cannot be undone. Are you absolutely sure?")) return;
    try {
      // Deleting orders will cascade and effectively delete the customer from the view
      await supabase.from('orders').delete().eq('phone', phone);
      await supabase.from('customer_status').delete().eq('phone', phone);
      await logAction('PERMANENT_DELETE', 'Customer', phone);
      fetchCustomers();
    } catch (err) {
      alert("Failed to permanently delete customer and orders");
    }
  };

  const handleBulkArchive = async () => {
    if (!selectedPhones.length || !confirm(`Archive ${selectedPhones.length} selected customers?`)) return;
    
    try {
      for (const phone of selectedPhones) {
        await updateCustomerStatus(phone, true);
        await logAction('BULK_ARCHIVE', 'Customer', phone);
      }
      setSelectedPhones([]);
      fetchCustomers();
    } catch (err) {
      alert("Failed to bulk archive");
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedPhones.length || !confirm(`PERMANENT DELETE ${selectedPhones.length} selected customers AND their orders?`)) return;
    try {
      for (const phone of selectedPhones) {
        await supabase.from('orders').delete().eq('phone', phone);
        await supabase.from('customer_status').delete().eq('phone', phone);
        await logAction('BULK_PERMANENT_DELETE', 'Customer', phone);
      }
      setSelectedPhones([]);
      fetchCustomers();
    } catch (err) {
      alert("Failed to bulk delete");
    }
  };

  const toggleSelection = (phone: string) => {
    setSelectedPhones(prev => prev.includes(phone) ? prev.filter(p => p !== phone) : [...prev, phone]);
  };

  const toggleAll = () => {
    if (selectedPhones.length === processedCustomers.length && processedCustomers.length > 0) {
      setSelectedPhones([]);
    } else {
      setSelectedPhones(processedCustomers.map(c => c.phone));
    }
  };

  // Filter & Sort
  const processedCustomers = customers
    .filter(c => 
      c.customer_name.toLowerCase().includes(search.toLowerCase()) || 
      c.phone.includes(search)
    )
    .sort((a, b) => {
      const { key, direction } = sortConfig;
      let valA = a[key];
      let valB = b[key];

      if (key === 'last_order_date') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });

  const SortIcon = ({ column }: { column: string }) => {
    if (sortConfig.key !== column) return <ArrowUpDown className="h-3 w-3 opacity-30 ml-1" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />;
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-card">
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          {showArchived ? 'Archived Customers' : 'Active Customers'}
          <span className="text-sm font-semibold bg-amber/10 text-amber px-2 py-0.5 rounded-full">{processedCustomers.length}</span>
        </h2>
        
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 items-center">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/45" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or phone..."
              className="w-full rounded-xl bg-atmosphere/50 py-2 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-amber/40"
            />
          </div>
          
          <button 
            onClick={() => setShowArchived(!showArchived)}
            className={`px-4 py-2 rounded-xl text-sm font-bold border transition w-full sm:w-auto ${showArchived ? 'bg-amber text-white border-amber' : 'bg-white border-black/10 text-foreground/70 hover:bg-atmosphere'}`}
          >
            {showArchived ? 'View Active' : 'View Archived'}
          </button>
          
          {selectedPhones.length > 0 && (
            <div className="flex gap-2 w-full sm:w-auto">
              {!showArchived && (
                <button onClick={handleBulkArchive} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold bg-orange-100 text-orange-700 hover:bg-orange-200 transition">
                  <Archive className="h-4 w-4" /> Bulk Archive
                </button>
              )}
              <button onClick={handleBulkDelete} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold bg-red-100 text-red-700 hover:bg-red-200 transition">
                <Trash2 className="h-4 w-4" /> Bulk Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-amber" /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-atmosphere/50 text-foreground/60 border-b border-black/10">
              <tr>
                <th className="px-4 py-3 rounded-tl-xl w-12 text-center">
                  <button onClick={toggleAll} className="text-foreground/40 hover:text-amber">
                    {processedCustomers.length > 0 && selectedPhones.length === processedCustomers.length ? <CheckSquare className="h-5 w-5 text-amber" /> : <Square className="h-5 w-5" />}
                  </button>
                </th>
                <th className="px-4 py-3 cursor-pointer hover:bg-black/5" onClick={() => handleSort('customer_name')}>
                  <div className="flex items-center">Name <SortIcon column="customer_name" /></div>
                </th>
                <th className="px-4 py-3 cursor-pointer hover:bg-black/5" onClick={() => handleSort('phone')}>
                  <div className="flex items-center">Phone <SortIcon column="phone" /></div>
                </th>
                <th className="px-4 py-3 cursor-pointer hover:bg-black/5" onClick={() => handleSort('total_orders')}>
                  <div className="flex items-center">Orders <SortIcon column="total_orders" /></div>
                </th>
                <th className="px-4 py-3 cursor-pointer hover:bg-black/5" onClick={() => handleSort('total_spent')}>
                  <div className="flex items-center">Total Spend <SortIcon column="total_spent" /></div>
                </th>
                <th className="px-4 py-3 cursor-pointer hover:bg-black/5" onClick={() => handleSort('last_order_date')}>
                  <div className="flex items-center">Last Order Date <SortIcon column="last_order_date" /></div>
                </th>
                <th className="px-4 py-3 text-right rounded-tr-xl">Actions</th>
              </tr>
            </thead>
            <tbody>
              {processedCustomers.map((customer, idx) => (
                <tr key={idx} className={`border-b border-black/5 hover:bg-atmosphere/30 transition ${selectedPhones.includes(customer.phone) ? 'bg-amber/5' : ''}`}>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleSelection(customer.phone)} className="text-foreground/30 hover:text-amber">
                      {selectedPhones.includes(customer.phone) ? <CheckSquare className="h-5 w-5 text-amber" /> : <Square className="h-5 w-5" />}
                    </button>
                  </td>
                  <td className="px-4 py-3 font-semibold">{customer.customer_name}</td>
                  <td className="px-4 py-3 text-foreground/70">{customer.phone}</td>
                  <td className="px-4 py-3">
                    <span className="bg-amber/10 text-amber font-bold px-2 py-1 rounded-md">{customer.total_orders}</span>
                  </td>
                  <td className="px-4 py-3 font-bold text-green-600">₹{formatPrice(customer.total_spent)}</td>
                  <td className="px-4 py-3 text-foreground/60">
                    {new Date(customer.last_order_date).toLocaleDateString()} {new Date(customer.last_order_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {!showArchived ? (
                        <button onClick={() => handleArchive(customer.phone)} className="p-1.5 text-orange-500 hover:bg-orange-50 rounded-lg transition" title="Archive Customer">
                          <Archive className="h-4 w-4" />
                        </button>
                      ) : (
                        <button onClick={() => handleRestore(customer.phone)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition" title="Restore Customer">
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      )}
                      <button onClick={() => handleDelete(customer.phone)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition" title="Permanently Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {processedCustomers.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-foreground/50">No customers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
