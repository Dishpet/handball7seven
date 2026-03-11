import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
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
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import Designs from "./pages/admin/Designs";

import Content from "./pages/admin/Content";
import Settings from "./pages/admin/Settings";
import Orders from "./pages/admin/Orders";
import AdminUsers from "./pages/admin/Users";
import { RequireAdmin } from "@/components/admin/RequireAdmin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <I18nProvider>
        <CartProvider>
          <TooltipProvider>
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/collections" element={<Collections />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/auth" element={<Auth />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<RequireAdmin><Dashboard /></RequireAdmin>} />
                <Route path="/admin/products" element={<RequireAdmin><Products /></RequireAdmin>} />
                
                <Route path="/admin/designs" element={<RequireAdmin><Designs /></RequireAdmin>} />
                <Route path="/admin/content" element={<RequireAdmin><Content /></RequireAdmin>} />
                <Route path="/admin/users" element={<RequireAdmin><AdminUsers /></RequireAdmin>} />
                <Route path="/admin/settings" element={<RequireAdmin><Settings /></RequireAdmin>} />
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
