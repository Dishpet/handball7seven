import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Package, User, LogOut, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

function statusColor(status: string) {
  switch (status) {
    case "paid":
    case "completed":
      return "text-green-500 bg-green-500/10 border-green-500/20";
    case "shipped":
      return "text-blue-500 bg-blue-500/10 border-blue-500/20";
    case "pending":
      return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
    case "canceled":
      return "text-destructive bg-destructive/10 border-destructive/20";
    default:
      return "text-muted-foreground bg-muted border-border";
  }
}

export default function Account() {
  const { user, loading, signOut } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .single();
      return data;
    },
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />
      <div className="pt-24 pb-20 px-5 max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary/10 border border-primary/20 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-display uppercase tracking-widest">
                {profile?.full_name || "My Account"}
              </h1>
              <p className="text-muted-foreground text-sm font-body">{user.email}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-display uppercase tracking-widest text-xs py-2 px-3 border border-border hover:border-foreground/30 min-h-[44px]"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>

        {/* Orders Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Package className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-display uppercase tracking-widest">Order History</h2>
          </div>

          {ordersLoading ? (
            <div className="text-muted-foreground font-body text-sm py-8 text-center">Loading orders...</div>
          ) : !orders || orders.length === 0 ? (
            <div className="border border-border p-8 sm:p-12 text-center">
              <Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-body mb-4">You haven't placed any orders yet.</p>
              <Link to="/shop" className="btn-primary inline-block text-center min-h-[44px] leading-[44px] text-sm">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order: any) => {
                const items = Array.isArray(order.items) ? order.items : [];
                return (
                  <div key={order.id} className="border border-border p-4 sm:p-6 hover:border-foreground/20 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-display uppercase tracking-widest text-xs text-muted-foreground">
                          {format(new Date(order.created_at), "MMM d, yyyy")}
                        </span>
                        <span className={`text-xs font-display uppercase tracking-widest px-3 py-1 border ${statusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <span className="font-display text-lg">€{Number(order.total).toFixed(2)}</span>
                    </div>
                    <div className="space-y-2">
                      {items.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-3 text-sm font-body">
                          {item.image && (
                            <img src={item.image} alt={item.name} className="w-10 h-10 object-cover bg-muted shrink-0" />
                          )}
                          <span className="flex-1 text-foreground/80">{item.name}</span>
                          <span className="text-muted-foreground">
                            {item.size && `${item.size} · `}×{item.quantity}
                          </span>
                          <span className="text-foreground/70">€{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-border/50 flex justify-end">
                      <span className="text-xs text-muted-foreground font-mono">
                        #{order.id.slice(0, 8)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
