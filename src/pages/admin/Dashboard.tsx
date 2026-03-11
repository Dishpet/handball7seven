import { AdminLayout } from "@/components/admin/AdminLayout";
import { Package, TrendingUp, Users, ShoppingCart } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useOrders } from "@/hooks/useOrders";

export default function Dashboard() {
  const { data: products } = useProducts(false);
  const { data: orders } = useOrders();

  const totalRevenue = orders?.reduce((s, o) => s + Number(o.total), 0) ?? 0;
  const activeProducts = products?.filter(p => p.is_visible).length ?? 0;
  const newOrders = orders?.filter(o => o.status === 'pending').length ?? 0;

  const stats = [
    { label: "Total Revenue", value: `€${totalRevenue.toFixed(2)}`, icon: TrendingUp },
    { label: "Active Products", value: String(activeProducts), icon: Package },
    { label: "Pending Orders", value: String(newOrders), icon: ShoppingCart },
    { label: "Total Orders", value: String(orders?.length ?? 0), icon: Users },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-display uppercase tracking-widest font-black text-white">Dashboard Overview</h2>
          <p className="text-white/60 font-body">Welcome to the H7 Shop Administration</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-black border border-white/10 p-6 flex items-start justify-between">
                <div>
                  <p className="text-white/50 font-display uppercase tracking-widest text-xs mb-1">{stat.label}</p>
                  <p className="text-2xl font-black text-white">{stat.value}</p>
                </div>
                <div className="p-3 bg-white/5 text-primary">
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-black border border-white/10 p-6 min-h-[400px] flex flex-col">
            <h3 className="text-xl font-display uppercase tracking-widest font-bold text-white mb-4">Recent Orders</h3>
            {orders && orders.length > 0 ? (
              <div className="flex-1 space-y-3 overflow-y-auto">
                {orders.slice(0, 10).map(order => (
                  <div key={order.id} className="border-b border-white/5 pb-3 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-white">{order.customer_name || order.customer_email || 'Guest'}</p>
                      <p className="text-xs text-white/40">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-white font-bold">€{Number(order.total).toFixed(2)}</p>
                      <span className={`text-xs uppercase tracking-widest ${order.status === 'pending' ? 'text-yellow-400' : order.status === 'completed' ? 'text-green-400' : 'text-white/50'}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 border border-dashed border-white/20 flex items-center justify-center text-white/30 font-display uppercase tracking-widest">
                No orders yet
              </div>
            )}
          </div>

          <div className="bg-black border border-white/10 p-6 min-h-[400px] flex flex-col">
            <h3 className="text-xl font-display uppercase tracking-widest font-bold text-white mb-4">Low Stock Products</h3>
            <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
              {products?.filter(p => p.stock_quantity < 20).map(p => (
                <div key={p.id} className="border-b border-white/5 pb-3 last:border-0">
                  <p className="text-sm text-white">{p.name}</p>
                  <p className="text-xs text-red-400 mt-1">{p.stock_quantity} remaining</p>
                </div>
              ))}
              {(!products || products.filter(p => p.stock_quantity < 20).length === 0) && (
                <p className="text-white/30 text-sm font-body">All products well stocked</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
