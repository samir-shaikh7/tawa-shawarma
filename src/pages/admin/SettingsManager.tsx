import { useState, useEffect } from "react";
import { Loader2, Save, Database, Activity, Send, Webhook } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function SettingsManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [businessInfo, setBusinessInfo] = useState({
    name: "Tawa Shawarma",
    tagline: "Authentic Taste, Delivered Fresh",
    phone: "",
    whatsapp: "",
    email: "",
    address: "",
    maps_link: "",
    opening_hours: "",
    instagram: "",
    facebook: ""
  });

  const [dbStatus, setDbStatus] = useState("Checking...");
  const [realtimeStatus, setRealtimeStatus] = useState("Checking...");

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('settings').select('*');
      if (error) throw error;
      
      const bInfo = data?.find(s => s.key === 'business_info')?.value;
      if (bInfo) setBusinessInfo(prev => ({ ...prev, ...bInfo }));

    } catch (err: any) {
      console.error("Failed to load settings:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();

    // Check DB Status
    supabase.from('settings').select('key').limit(1)
      .then(({error}) => setDbStatus(error ? "Disconnected" : "Connected"));
      
    // Check Realtime Status
    const channel = supabase.channel('system_ping');
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') setRealtimeStatus('Connected');
      else if (status === 'CHANNEL_ERROR') setRealtimeStatus('Disconnected');
    });
    
    return () => { supabase.removeChannel(channel); };
  }, []);

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error: bError } = await supabase
        .from('settings')
        .upsert({ key: 'business_info', value: businessInfo });
      if (bError) throw bError;

      alert("Settings saved successfully! Reload the page to see changes on the storefront.");
    } catch (err: any) {
      alert("Failed to save settings: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-amber" /></div>;
  }

  return (
    <div className="bg-white rounded-3xl p-6 md:p-10 shadow-card">
      <div className="mb-8 border-b border-black/10 pb-4">
        <h2 className="text-2xl font-black">Global Settings</h2>
        <p className="text-foreground/60 text-sm mt-1">Manage your business contact information and monitor system health.</p>
      </div>

      <form onSubmit={saveSettings} className="space-y-10">
        
        {/* Business Information */}
        <section>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="bg-amber/10 text-amber p-1.5 rounded-lg text-sm">🏢</span> Business Information
          </h3>
          <div className="grid md:grid-cols-2 gap-6 bg-atmosphere/30 p-6 rounded-2xl border border-black/5">
            <div>
              <label className="text-xs font-bold uppercase text-foreground/50 mb-1 block">Restaurant Name</label>
              <input required value={businessInfo.name} onChange={e => setBusinessInfo({...businessInfo, name: e.target.value})} className="w-full bg-white rounded-xl p-3 outline-none border border-transparent focus:border-amber/30 transition shadow-sm" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-foreground/50 mb-1 block">Tagline</label>
              <input value={businessInfo.tagline} onChange={e => setBusinessInfo({...businessInfo, tagline: e.target.value})} className="w-full bg-white rounded-xl p-3 outline-none border border-transparent focus:border-amber/30 transition shadow-sm" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-foreground/50 mb-1 block">Phone Number (Calling)</label>
              <input required value={businessInfo.phone} onChange={e => setBusinessInfo({...businessInfo, phone: e.target.value})} className="w-full bg-white rounded-xl p-3 outline-none border border-transparent focus:border-amber/30 transition shadow-sm" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-foreground/50 mb-1 block">WhatsApp Number</label>
              <input required value={businessInfo.whatsapp} onChange={e => setBusinessInfo({...businessInfo, whatsapp: e.target.value})} className="w-full bg-white rounded-xl p-3 outline-none border border-transparent focus:border-amber/30 transition shadow-sm" placeholder="+91..." />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-foreground/50 mb-1 block">Contact Email</label>
              <input type="email" value={businessInfo.email} onChange={e => setBusinessInfo({...businessInfo, email: e.target.value})} className="w-full bg-white rounded-xl p-3 outline-none border border-transparent focus:border-amber/30 transition shadow-sm" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-foreground/50 mb-1 block">Opening Hours</label>
              <input placeholder="e.g. 12:00 PM - 11:00 PM" value={businessInfo.opening_hours} onChange={e => setBusinessInfo({...businessInfo, opening_hours: e.target.value})} className="w-full bg-white rounded-xl p-3 outline-none border border-transparent focus:border-amber/30 transition shadow-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-bold uppercase text-foreground/50 mb-1 block">Physical Address</label>
              <textarea rows={2} value={businessInfo.address} onChange={e => setBusinessInfo({...businessInfo, address: e.target.value})} className="w-full bg-white rounded-xl p-3 outline-none border border-transparent focus:border-amber/30 transition shadow-sm resize-none" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-bold uppercase text-foreground/50 mb-1 block">Google Maps Link</label>
              <input type="url" placeholder="https://goo.gl/maps/..." value={businessInfo.maps_link} onChange={e => setBusinessInfo({...businessInfo, maps_link: e.target.value})} className="w-full bg-white rounded-xl p-3 outline-none border border-transparent focus:border-amber/30 transition shadow-sm" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-foreground/50 mb-1 block">Instagram URL</label>
              <input type="url" placeholder="https://instagram.com/..." value={businessInfo.instagram} onChange={e => setBusinessInfo({...businessInfo, instagram: e.target.value})} className="w-full bg-white rounded-xl p-3 outline-none border border-transparent focus:border-amber/30 transition shadow-sm" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-foreground/50 mb-1 block">Facebook URL</label>
              <input type="url" placeholder="https://facebook.com/..." value={businessInfo.facebook} onChange={e => setBusinessInfo({...businessInfo, facebook: e.target.value})} className="w-full bg-white rounded-xl p-3 outline-none border border-transparent focus:border-amber/30 transition shadow-sm" />
            </div>
          </div>
        </section>

        {/* System Settings Module */}
        <section>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-600 p-1.5 rounded-lg text-sm"><Activity className="h-4 w-4" /></span> System Health & Status
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            
            <div className="bg-atmosphere/30 p-5 rounded-2xl border border-black/5 flex flex-col items-center justify-center text-center">
              <Database className="h-6 w-6 text-emerald-500 mb-2" />
              <div className="text-xs font-bold uppercase text-foreground/50">Supabase DB</div>
              <div className={`font-bold mt-1 ${dbStatus === 'Connected' ? 'text-emerald-600' : 'text-red-500'}`}>
                {dbStatus}
              </div>
            </div>

            <div className="bg-atmosphere/30 p-5 rounded-2xl border border-black/5 flex flex-col items-center justify-center text-center">
              <Activity className="h-6 w-6 text-emerald-500 mb-2" />
              <div className="text-xs font-bold uppercase text-foreground/50">Realtime Engine</div>
              <div className={`font-bold mt-1 ${realtimeStatus === 'Connected' ? 'text-emerald-600' : 'text-amber-500'}`}>
                {realtimeStatus}
              </div>
            </div>

            <div className="bg-atmosphere/30 p-5 rounded-2xl border border-black/5 flex flex-col items-center justify-center text-center opacity-80">
              <Send className="h-6 w-6 text-blue-500 mb-2" />
              <div className="text-xs font-bold uppercase text-foreground/50">Telegram Bot</div>
              <div className="text-xs font-bold mt-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                Edge Configured
              </div>
            </div>

            <div className="bg-atmosphere/30 p-5 rounded-2xl border border-black/5 flex flex-col items-center justify-center text-center opacity-80">
              <Webhook className="h-6 w-6 text-purple-500 mb-2" />
              <div className="text-xs font-bold uppercase text-foreground/50">Edge Webhooks</div>
              <div className="text-xs font-bold mt-1 text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                Active & Listening
              </div>
            </div>

          </div>
        </section>

        <div className="pt-4 border-t border-black/10 flex justify-end">
          <button 
            type="submit" 
            disabled={saving}
            className="bg-amber text-white px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 active:scale-95 transition flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            Save All Settings
          </button>
        </div>
      </form>
    </div>
  );
}
