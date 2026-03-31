import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n";
import { CartProvider } from "@/lib/cart";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import About from "./pages/About";
import Collections from "./pages/Collections";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Account from "./pages/Account";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import CheckoutCanceled from "./pages/CheckoutCanceled";
import Shipping from "./pages/Shipping";
import Faq from "./pages/Faq";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import Unsubscribe from "./pages/Unsubscribe";
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import Designs from "./pages/admin/Designs";

import Content from "./pages/admin/Content";
import Settings from "./pages/admin/Settings";
import Orders from "./pages/admin/Orders";
import AdminUsers from "./pages/admin/Users";
import StoreSettings from "./pages/admin/StoreSettings";
import { RequireAdmin } from "@/components/admin/RequireAdmin";

const queryClient = new QueryClient();

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <I18nProvider>
        <CartProvider>
          <TooltipProvider>
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/collections" element={<Collections />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/account" element={<Account />} />
                <Route path="/checkout/success" element={<CheckoutSuccess />} />
                <Route path="/checkout/canceled" element={<CheckoutCanceled />} />
                <Route path="/shipping" element={<Shipping />} />
                <Route path="/faq" element={<Faq />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<RequireAdmin><Dashboard /></RequireAdmin>} />
                <Route path="/admin/products" element={<RequireAdmin><Products /></RequireAdmin>} />
                
                <Route path="/admin/designs" element={<RequireAdmin><Designs /></RequireAdmin>} />
                <Route path="/admin/content" element={<RequireAdmin><Content /></RequireAdmin>} />
                <Route path="/admin/users" element={<RequireAdmin><AdminUsers /></RequireAdmin>} />
                <Route path="/admin/settings" element={<RequireAdmin><Settings /></RequireAdmin>} />
                <Route path="/admin/store-settings" element={<RequireAdmin><StoreSettings /></RequireAdmin>} />
                <Route path="/admin/orders" element={<RequireAdmin><Orders /></RequireAdmin>} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </I18nProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
