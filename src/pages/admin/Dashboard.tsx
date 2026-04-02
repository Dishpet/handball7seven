import { AdminLayout } from "@/components/admin/AdminLayout";
import { Package, TrendingUp, Users, ShoppingCart } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useOrders } from "@/hooks/useOrders";
import { useMemo, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AdminInstallPrompt } from "@/components/admin/AdminInstallPrompt";
import { PushNotificationSetup } from "@/components/admin/PushNotificationSetup";
import { DashboardAnalytics } from "@/components/admin/DashboardAnalytics";

export default function Dashboard() {
  const { data: products } = useProducts(false);
  const { data: orders } = useOrders();
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview');

  const totalRevenue = orders?.reduce((s, o) => s + Number(o.total), 0) ?? 0;
  const activeProducts = products?.filter(p => p.is_visible).length ?? 0;
  const newOrders = orders?.filter(o => o.status === 'pending').length ?? 0;

  const chartData = useMemo(() => {
    if (!orders || orders.length === 0) {
      const today = new Date();
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (6 - i));
        return { date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), revenue: 0, orders: 0 };
      });
    }
    const byDay: Record<string, { revenue: number; orders: number; sortKey: string }> = {};
    orders.forEach(o => {
      const d = new Date(o.created_at);
      const sortKey = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!byDay[sortKey]) byDay[sortKey] = { revenue: 0, orders: 0, sortKey };
      byDay[sortKey].revenue += Number(o.total);
      byDay[sortKey].orders += 1;
    });
    return Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, v]) => ({ date: new Date(key).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), revenue: v.revenue, orders: v.orders }));
  }, [orders]);

  const stats = [
    { label: "Total Revenue", value: `€${totalRevenue.toFixed(2)}`, icon: TrendingUp },
    { label: "Active Products", value: String(activeProducts), icon: Package },
    { label: "Pending Orders", value: String(newOrders), icon: ShoppingCart },
    { label: "Total Orders", value: String(orders?.length ?? 0), icon: Users },
  ];

  const tabs = [
    { key: 'overview' as const, label: 'Overview' },
    { key: 'analytics' as const, label: 'Analytics' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminInstallPrompt />
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-display uppercase tracking-widest font-black text-white">Dashboard</h2>
            <p className="text-white/60 font-body text-sm mt-1">Welcome to H7 Administration</p>
          </div>
          <PushNotificationSetup />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-white/10">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 font-display uppercase tracking-widest text-xs transition-colors border-b-2 -mb-px ${
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-white/50 hover:text-white/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {stats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="bg-black border border-white/10 p-4 md:p-6 flex items-start justify-between">
                    <div className="min-w-0">
                      <p className="text-white/50 font-display uppercase tracking-wider text-[10px] sm:text-xs mb-1 truncate">{stat.label}</p>
                      <p className="text-lg sm:text-2xl font-black text-white truncate">{stat.value}</p>
                    </div>
                    <div className="p-2 md:p-3 bg-white/5 text-primary shrink-0 ml-2">
                      <Icon className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sales Chart */}
            <div className="bg-black border border-white/10 p-4 md:p-6">
              <h3 className="text-base md:text-xl font-display uppercase tracking-widest font-bold text-white mb-6">Sales Overview</h3>
              <div className="h-[250px] md:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} tickFormatter={(v) => `€${v}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, fontSize: 12 }}
                      labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
                      itemStyle={{ color: 'white' }}
                      formatter={(value: number) => [`€${value.toFixed(2)}`, 'Revenue']}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#salesGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              <div className="lg:col-span-2 bg-black border border-white/10 p-4 md:p-6 min-h-[300px] md:min-h-[400px] flex flex-col">
                <h3 className="text-base md:text-xl font-display uppercase tracking-widest font-bold text-white mb-4">Recent Orders</h3>
                {orders && orders.length > 0 ? (
                  <div className="flex-1 space-y-3 overflow-y-auto">
                    {orders.slice(0, 10).map(order => (
                      <div key={order.id} className="border-b border-white/5 pb-3 flex justify-between items-center gap-2">
                        <div className="min-w-0">
                          <p className="text-sm text-white truncate">{order.customer_name || order.customer_email || 'Guest'}</p>
                          <p className="text-xs text-white/40">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm text-white font-bold">€{Number(order.total).toFixed(2)}</p>
                          <span className={`text-xs uppercase tracking-widest ${order.status === 'pending' ? 'text-primary' : order.status === 'completed' ? 'text-accent-foreground' : 'text-white/50'}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 border border-dashed border-white/20 flex items-center justify-center text-white/30 font-display uppercase tracking-widest text-sm">
                    No orders yet
                  </div>
                )}
              </div>

              <div className="bg-black border border-white/10 p-4 md:p-6 min-h-[300px] md:min-h-[400px] flex flex-col">
                <h3 className="text-base md:text-xl font-display uppercase tracking-widest font-bold text-white mb-4">Low Stock</h3>
                <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
                  {products?.filter(p => p.stock_quantity < 20).map(p => (
                    <div key={p.id} className="border-b border-white/5 pb-3 last:border-0">
                      <p className="text-sm text-white">{p.name}</p>
                      <p className="text-xs text-destructive mt-1">{p.stock_quantity} remaining</p>
                    </div>
                  ))}
                  {(!products || products.filter(p => p.stock_quantity < 20).length === 0) && (
                    <p className="text-white/30 text-sm font-body">All products well stocked</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'analytics' && <DashboardAnalytics />}
      </div>
    </AdminLayout>
  );
}
