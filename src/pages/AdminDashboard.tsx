import { useState, useEffect } from "react";
import { Loader2, ShoppingBag, UtensilsCrossed, Users, Settings, Star, LogOut, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";

import OrdersManager from "./admin/OrdersManager";
import MenuManager from "./admin/MenuManager";
import CustomersManager from "./admin/CustomersManager";
import ReviewsManager from "./admin/ReviewsManager";
import SettingsManager from "./admin/SettingsManager";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  
  const [activeTab, setActiveTab] = useState("orders");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setIsAuthChecking(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      setIsAuthChecking(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (err: any) {
      alert(err.message || "Failed to login. Please check your credentials.");
    } finally {
      setLoginLoading(false);
    }
  };

  if (isAuthChecking) {
    return (
      <div className="bg-atmosphere min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-amber" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-atmosphere min-h-screen text-foreground py-10 flex items-center justify-center px-4">
        <form onSubmit={handleLogin} className="max-w-sm w-full bg-white p-8 rounded-3xl shadow-card text-center">
          <h1 className="text-2xl font-bold mb-6">Admin Login</h1>
          <div className="space-y-4 mb-6">
            <input
              type="email"
              required
              placeholder="Admin Email"
              className="w-full rounded-xl border border-black/10 bg-atmosphere/50 p-3 text-sm outline-none focus:border-amber/50 focus:ring-2 focus:ring-amber/20 text-center"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              required
              placeholder="Admin Password"
              className="w-full rounded-xl border border-black/10 bg-atmosphere/50 p-3 text-sm outline-none focus:border-amber/50 focus:ring-2 focus:ring-amber/20 text-center"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={loginLoading}
            className="w-full flex items-center justify-center gap-2 rounded-full gradient-primary py-3 font-bold text-white shadow-soft transition hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:scale-100"
          >
            {loginLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Login"}
          </button>
        </form>
      </div>
    );
  }

  const TABS = [
    { id: "orders", label: "Live Orders", icon: ShoppingBag },
    { id: "menu", label: "Menu & Categories", icon: UtensilsCrossed },
    { id: "customers", label: "Customers", icon: Users },
    { id: "reviews", label: "Reviews", icon: Star },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="bg-atmosphere min-h-screen text-foreground py-10">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-soft transition hover:text-amber">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-3xl font-bold">Restaurant CMS</h1>
          </div>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="flex items-center gap-2 text-sm font-bold bg-white border border-black/10 px-4 py-2 rounded-full shadow-sm hover:bg-red-50 hover:text-red-600 transition"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="w-full lg:w-64 shrink-0">
            <div className="bg-white rounded-3xl p-4 shadow-card flex flex-col gap-2 sticky top-24">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all text-sm ${
                      isActive 
                        ? 'bg-amber text-white shadow-soft scale-[1.02]' 
                        : 'hover:bg-atmosphere text-foreground/70 hover:text-black'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {activeTab === 'orders' && <OrdersManager />}
            {activeTab === 'menu' && <MenuManager />}
            {activeTab === 'customers' && <CustomersManager />}
            {activeTab === 'reviews' && <ReviewsManager />}
            {activeTab === 'settings' && <SettingsManager />}
          </div>
        </div>
      </div>
    </div>
  );
}
