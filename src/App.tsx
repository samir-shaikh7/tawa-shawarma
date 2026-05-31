import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import CartPage from "@/pages/CartPage";
import CheckoutPage from "@/pages/CheckoutPage";
import OrderSuccessPage from "@/pages/OrderSuccessPage";
import TrackOrderPage from "@/pages/TrackOrderPage";
import AdminDashboard from "@/pages/AdminDashboard";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { FloatingButtons } from "@/components/site/Floating";
import { ScrollToTop } from "@/components/site/ScrollToTop";

import { CartProvider } from "@/lib/cart";
import { SettingsProvider } from "@/lib/settings";

function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
      <FloatingButtons />
    </div>
  );
}

export function App() {
  return (
    <SettingsProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            <Route path="/admin/*" element={<AdminDashboard />} />
            <Route element={<SiteLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-success/:id" element={<OrderSuccessPage />} />
              <Route path="/track" element={<TrackOrderPage />} />
              <Route path="*" element={<HomePage />} />
            </Route>
          </Routes>
        </Router>
      </CartProvider>
    </SettingsProvider>
  );
}
